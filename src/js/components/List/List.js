import { makeTrelloAPIRequests } from '../../utils';
import nameMap from '../../data/users.json';
import globalCache from '../../cache';
import Error from '../Error/Error';
import moment from 'moment';

const {
  elements,
  boardApiRequests,
  boards,
  users
} = globalCache;

export default class List {
  constructor(username) {
    if (!nameMap[username]) {
      console.error(`Could not read username: ${username}`);
      return false;
    }
    this.cache = {
      username,
      name: nameMap[username].name,
      discipline: nameMap[username].discipline,
      userData: null,
    }
    const init = () => {
      this.create();
      this.cache.userData.cards.forEach((card) => {
        this.addCard(card);
      });
      this.render();
    };
    const error = (err) => {
      console.error(err);
      if (err && err.responseJSON && err.responseJSON.error) {
        new Error(err.responseJSON.error);
      }
    };
    
    if (Object.prototype.hasOwnProperty.call(users, username)) {
      // User data is already in global cache. Import to local cache.
      this.cache.userData = users[username];
      this.loadNewBoards()
        .then(init)
        .catch(error);
    } else {
      // User data is new so make an API request
      this.loadUserData()
        .then((result1) => {
          return Promise.all([result1, this.loadNewBoards(result1)]);
        })
        .then(init)
        .catch(error);
    }

    return {
      addCard: this.addCard,
      cache: this.cache,
    }
  }

  /**
   * Create elements
   */
  create() {
    const { 
      username,
      name,
      discipline,
      userData
    } = this.cache;

    const { 
      memberObject, 
      cards
    } = userData;
    
    const element = document.createElement('div');
    element.className = 'list';
    element.innerHTML = `
      <div class="list__head">
        <div class="list__avatar">${memberObject.avatarHash ? `<img src="https://trello-avatars.s3.amazonaws.com/${memberObject.avatarHash}/50.png"/>` : ''}</div>
        <div class="list__nameBlock">
          <div class="list__name">${name}</div>
          <div class="list__discipline">${discipline}</div>
        </div>
        <div class="list__username">${username}</div>
      </div>
      <div class="list__body">
        <div class="list__card-count">
          <em>${cards.length}</em> <span>${(cards.length === 1 ? 'card' : 'cards')}</span>
        </div>
      </div>
    `;

    this.cache.component = element;
  }

  /**
   * Render component
   */
  render() {
    elements.devLists.appendChild(this.cache.component); 
    List.addBoardData();
  }

  /**
   * Add a card to the list
   * @param {object} data API response for card data
   */
  addCard(data) {
    const getData = {
      lastActivity: () => {
        const then = moment(data.dateLastActivity);
        const now = moment();
        return then.from(now);
      },
      dateCreated: () => { 
        const date = new Date(1000 * parseInt(data.id.substring(0,8),16));
        return moment(date).format('MMM DD YYYY');
      },
      timeSinceCreation: () => {
        const date = new Date(1000 * parseInt(data.id.substring(0,8),16));
        const then = moment(date);
        const now = moment();
        return then.from(now);
      },
      currentList: () => {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            resolve('Promise resolved');
          }, 5000);
        });
      },
      timeInList: () => {
        const { actions } = data;
        let toReturn;
        if (actions) {
          actions.forEach((action) => {
            if (action.data.listBefore && action.data.listAfter) {
              const { date } = action;
              const then = moment(date);
              const now = moment();
              toReturn = then.from(now).replace(' ago', '');
              return;
            }
          });
          if (!toReturn) {
            // Card is still in original list
            toReturn = getData.timeSinceCreation().replace(' ago', '');
          }
        }
        return toReturn;
      },
    };

    // Template
    const list = this.cache.component.querySelector('.list__body')
    const template = `
      <!-- Card -->
      <div class="list__card" data-list="${data.idList}">
        <div class="list__card__title">
          <a href="${data.shortUrl}">${data.name}</a>
        </div>
        <div class="list__card__desc">${data.desc}</div>
        <div class="list__card__board">
          <a class="list__card__boardID" href="${boards[data.idBoard].url}">${boards[data.idBoard].name}</a>
        </div>
        <div class="list__card__data">
          <em>Last activity:</em> ${getData.lastActivity()}
        </div>
        <div class="list__card__data">
          <em>Created:</em> ${getData.dateCreated()} (${getData.timeSinceCreation()})
        </div>
        <div class="list__card__data">
          <em>Time in list:</em> ${getData.timeInList()}
        </div>
      </div>
      <!-- End Card -->
    `;
    list.insertAdjacentHTML('beforeend', template);
  }

  /**
   * Make requests to Trello API for user and card data
   */
  loadUserData() {
    // make API request to /user and /user/cards
    return new Promise((resolve, reject) => {
      const { username } = this.cache;

      makeTrelloAPIRequests([`/members/${username}`, `/members/${username}/cards?actions=updateCard`])
        .then((result) => {
          const data = {
            memberObject: result[0][0][200],
            cards: result[0][1][200],
            result: result[0]
          };
          users[username] = data; // Global cache
          this.cache.userData = users[username]; // Local cache
          List.addBoardData();
          resolve();
        })
        .catch(reject);
    });
  }

  /**
   * Make requests to Trello API for any new board IDs
   * in card data
   */
  loadNewBoards() {
    return new Promise((resolve, reject) => {
      const { username } = this.cache;

      // Push any new board IDs (not cached or in active request) to boardApiRequests.pending
      users[username].cards.forEach((card) => {
        const id = card.idBoard;
        const boardCached = Object.prototype.hasOwnProperty.call(boards, id);
        const requestAlreadySent = boardApiRequests.active.indexOf(id) > -1;
        if (!boardCached && !requestAlreadySent) {
          boards[id] = {
            name: id,
          };
          boardApiRequests.pending.push(id);
        }
      });

      if (boardApiRequests.pending.length) {
        boardApiRequests.active = boardApiRequests.pending;
        boardApiRequests.pending = [];
        
        // Make API requests to return boards and lists
        const endpoints = boardApiRequests.active.map(id => `/boards/${id}?lists=all`);
        makeTrelloAPIRequests(endpoints)
          .then((results) => {
            /*
              Normalise the results
              If the result is from a batch request the response is structured differently
             */
            const wasBatchRequest = results[0].length > 1;
            let boardData = !wasBatchRequest ? results : (() => {
              let arr = [];
              results[0].forEach((result) => {
                arr.push(result[200]);
              });
              return arr;
            })();

            boardData.forEach((result) => {
              // Remove board ID from active requests
              const idx = boardApiRequests.active.indexOf(result.id);
              boardApiRequests.active.splice(idx, 1);
              boards[result.id] = result; // Global cache
            });

            List.addBoardData();
            resolve();
          })
          .catch((err) => {
            console.error(err);
            reject();
          });
      } else {
        resolve();
      }
    });
  }

  /**
   * API request for boards is made separately to member/card requests, so
   * when this is available add it all to the view
   */
  static addBoardData() {
    const cards = document.querySelectorAll('.list__card');
    Array.from(cards).forEach((card) => {
      // Add board and list names
      const boardID = card.querySelector('.list__card__boardID'); 
      const boardData = boards[boardID.innerText];
      if (boardData) {
        // Replace board ID with board name
        if (boardData.name !== boardID.innerText) {
          const { innerText } = boardID;
          boardID.innerText = boards[innerText].name;
          boardID.href = boards[innerText].url;
        }
 
        // Replace list ID with list name
        const listID = card.getAttribute('data-list');
        if (boardData.lists) {
          const listData = boardData.lists.filter(data => data.id === listID);
          if (listData && listData[0]) {
            const listName = listData[0].name.replace(/^\d+\.\s/, '');
            card.setAttribute('data-list', listName);
          }
        }
      }
    });
  }
}
