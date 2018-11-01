import nameMap from '../../data/users.json';
import globalCache from '../../cache';
import { makeTrelloAPIRequests } from '../../utils';
import Error from '../Error/Error';

const { 
  elements, 
  boardApiRequests, 
  boardNames,
  users
} = globalCache;

export default class List {
  constructor(username) {
    this.cache = {
      username,
      name: nameMap[username].name,
      discipline: nameMap[username].discipline,
    }
    
    if (Object.prototype.hasOwnProperty.call(users, username)) {
      // User data is already in global cache. Import to local cache.
      this.cache.userData = users[username];

      this.loadNewBoards()
        .then((result) => {
          this.create();
          this.render();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      // User data is new so make an API request
      this.loadUserData()
        .then((result1) => {
          return Promise.all([result1, this.loadNewBoards(result1)]);
        })
        .then((results) => {
          this.create();
          this.render();
        })
        .catch((err) => {
          console.log(err);
          if (err && err.responseJSON && err.responseJSON.error) {
            new Error(err.responseJSON.error);
          }
        });
    }

    return {
      addCard: this.addCard,
      removeCard: this.removeCard,
      cache: this.cache,
    }
  }

  /**
   * Make requests to Trello API for user and card data
   */
  loadUserData() {
    // make API request to /user and /user/cards
    return new Promise((resolve, reject) => {
      const { username } = this.cache;

      makeTrelloAPIRequests([
        `/members/${username}`,
        `/members/${username}/cards`
      ])
        .then((result) => {
          const data = {
            memberObject: result[0][0][200],
            cards: result[0][1][200],
            result: result[0]
          };
          users[username] = data; // Global cache
          this.cache.userData = users[username]; // Local cache
          this.updateBoardNames();
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
        const boardCached = Object.prototype.hasOwnProperty.call(boardNames, id);
        const requestAlreadySent = boardApiRequests.active.indexOf(id) > -1;
        if (!boardCached && !requestAlreadySent) {
            boardNames[id] = id;
            boardApiRequests.pending.push(id);
        }
      });

      if (boardApiRequests.pending.length) {
        boardApiRequests.active = boardApiRequests.pending;
        boardApiRequests.pending = [];
        
        // Make API requests
        const endpoints = boardApiRequests.active.map((id) => `/boards/${id}`);
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
              
              // Map board name in cache
              boardNames[result.id] = result.name;
            });
            resolve();
          })
          .catch((err) => {
            console.log(err);
            reject();
          });
      } else {
        resolve();
      }
    });
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

        <!-- Card -->
        ${cards.map((data) => `
          <div class="list__card">
            <div class="list__card__title">
              <a href="${data.shortUrl}">${data.name}</a>
            </div>
            <div class="list__card__desc">${data.desc}</div>
            <div class="list__card__board">
              <a class="list__card__boardID" href="#">${boardNames[data.idBoard]}</a>
            </div>
          </div>
        `).join('')}
        <!-- End Card -->
      </div>
    `;

    this.cache.component = element;
  }

  /**
   * Render component
   */
  render() {
    this.updateBoardNames();
    elements.devLists.appendChild(this.cache.component); 
  }

  /**
   * Replace any board IDs on page with board name
   */
  updateBoardNames() {
    const boardIDs = document.querySelectorAll('.list__card__boardID');
    Array.from(boardIDs).forEach((node) => {
      if (boardNames[node.innerText] && boardNames[node.innerText] !== node.innerText) {
        node.innerText = boardNames[node.innerText];
      }
    });
  }

  /**
   * Add a card to the list
   */
  addCard() {
  }

  /**
   * Remove a card from the list
   */
  removeCard() {
  }
}