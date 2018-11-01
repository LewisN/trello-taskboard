import nameMap from '../../data/users.json';
import globalCache from '../../cache';
import { makeTrelloAPIRequests } from '../../utils';

const { 
  elements, 
  boardApiRequests, 
  boardNames,
  users
} = globalCache;

export default class List {
  constructor(username) {
    console.log('Constructing List component');
    this.cache = {
      username,
      name: nameMap[username].name,
      discipline: nameMap[username].discipline,
    }
    
    if (Object.prototype.hasOwnProperty.call(users, username)) {
      console.log(`data for ${username} is cached`);

      // User data is already cached
      this.loadNewBoards()
        .then((result) => {
          this.create();
          this.render();
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      console.log(`data for ${username} is NOT cached - making a request`);
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
    const { cache } = this;

    // make API request to /user and /user/cards
    return new Promise((resolve, reject) => {
      const { username } = cache;
      console.log(`loading user data for ${username}`);

      makeTrelloAPIRequests([
        `members/${username}`,
        `members/${username}/cards`
      ])
        .then((result) => {
          console.log(`data successfully loaded for ${username}`);
          const data = {
            memberObject: result[0],
            cards: result[1],
            result: result
          };
          users[username] = data; // Global cache
          cache.userData = data; // Local cache
          this.updateBoardNames();
          resolve();
        })
        .catch((err) => {
          console.log(`error loading data for ${username}`);
          console.log(err);
          reject();
        });
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
        console.log(`new board requests are pending - making requests to ${boardApiRequests.pending.length} endpoints`);
        boardApiRequests.active = boardApiRequests.pending;
        boardApiRequests.pending = [];
        
        // Make API requests
        const endpoints = boardApiRequests.active.map((id) => `/boards/${id}`);
        makeTrelloAPIRequests(endpoints)
          .then((results) => {
            console.log(`board data loaded successfully`);
            results.forEach((result) => {
              // Remove board ID from active requests
              console.log(`removing board data from pending requests`);
              const idx = boardApiRequests.active.indexOf(result.id);
              boardApiRequests.active.splice(idx, 1);
              
              // Map board name in cache
              boardNames[result.id] = result.name;
            });
            resolve();
          })
          .catch((err) => {
            console.log(`error loading board data`);
            console.log(boardApiRequests.pending);
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