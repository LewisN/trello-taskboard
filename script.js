(function($) {
    /* ---------------------------------
     Helpers  
    --------------------------------- */
    function setCookie(c_name,value,exdays,c_domain) {
        c_domain = (typeof c_domain === "undefined") ? "" : "domain=" + c_domain + ";";
        var exdate=new Date();
        exdate.setDate(exdate.getDate() + exdays);
        var c_value=escape(value) + ((exdays==null) ? "" : "; expires="+exdate.toUTCString());
        document.cookie=c_name + "=" + c_value + ";" + c_domain + "path=/";
    }
    
    function getCookie(name) {
      var match = document.cookie.match(name+'=([^;]*)');
      return match ? match[1] : undefined;
    }
    

    /* ---------------------------------
     Trello API  
    --------------------------------- */
    var Trello = window.Trello;

    // Authenticate User
    Trello.authorize({
        type: 'iframe',
        name: 'UC Dev Overview',
        scope: {
            read: 'true',
            write: 'true' 
        },
        expiration: 'never',
        success: function() {
            console.log('Successful authentication');
        },
        error: function() {
            console.log('Error authenticating user');
        }
    });

    // Global object of users for List API
    window.users = {};

    var usernames,
        nameMap = {
            'lewisuc': 'Lewis',
            'rebeccauc': 'Bec',
            'scottuc': 'Scott',
            'damianuc': 'Damian',
            'bilaluc': 'Bilal',
            'daviduc': 'David',
            'joshuc': 'Josh',
            'ryanuc': 'Ryan',
            'bethuc': 'Beth',
            'emilyuc': 'Emily',
            'samuc': 'Sam G',
            'robertuc': 'Rob',
            'chrisuc': 'Chris R',
            'oliviauc': 'Olivia',
            'sambuc': 'Sam B',
            'hazeluc': 'Hazel',
            'carrieuc': 'Carrie',
            'danuc': 'Dan',
            'chriswuc': 'Chris W',
            'sarahuc': 'Sarah',
            'ammouc': 'Ammo',
            'alexuc': 'Alex',
            'adamuc': 'Adam'
        },
        boardNameMap = {},
        cachedData = {
            users: {},
            boards: []
        };


    // Function allows you to make parallel requests to the Trello API
    // Callback is ran when all promises to retrieve an endpoint response have been resolved
    function makeTrelloAPIRequests(endpoints) {
        var requests = [];

        // Show loader
        if (elements.loader.classList.contains('hidden')) {
            elements.loader.classList.remove('hidden');
        }

        // Create a promise for each endpoint and return the results when all
        // requests have been successful
        for (var i = 0; i < endpoints.length; i++) {
            requests.push(
                new Promise(function(resolve, reject) {
                    Trello.get(
                        endpoints[i],
                        function(data) {
                            // resolve promise
                            resolve(data); 
                        },
                        function(err) {
                            console.log(err);
                            // reject promise
                            reject('Error with request for user: ' + user); 

                            // Try again in 3s - Often caused by too many requests
                        }
                    );
                })
            );
        }

        return Promise.all(requests);
    }


    var elements = {
        devLists: document.getElementById('dev-lists'),
        loader: document.getElementById('loader')
    };


    function List(user) {
        this.user = user;
        var name = nameMap[user];

        // Create elements
        var list = document.createElement('div');
        list.className = 'list';

        this.generateHTML = function(data) {
            console.log('generating html');
            var memberObj = data[0],
                cardsData = data[1];

            var avatar = memberObj.avatarHash ? '<img src="https://trello-avatars.s3.amazonaws.com/' + memberObj.avatarHash + '/50.png"/>' : '';

            // List head
            var html = '<div class="list__head">';
            html += '<div class="list__avatar">' + avatar + '</div>';
            html += '<div class="list__name">' + name + '</div>';
            html += '<div class="list__username">' + user + '</div>';
            html += '</div>';
        
            // List body
            html += '<div class="list__body">';

            // Card count
            var cardsCount = cardsData.length;
            html += '<div class="list__card-count"><em>' + cardsCount + ' </em> <span>' + (cardsCount === 1 ? 'card' : 'cards') + '</span></div>';

            // For each card, create card HTML
            for (var i = 0; i < cardsData.length; i++) {
                var cardData = cardsData[i];

                html += '<div class="list__card">';
                html += '<div class="list__card__title"><a href="' + cardData.shortUrl + '">' + cardData.name + '</a></div>';
                html += '<div class="list__card__desc">' + cardData.desc + '</div>';
                html += '<div class="list__card__board"><a href="#">' + boardNameMap[cardData.idBoard] + '</a></div>';
                html += '</div>';
            }

            html += '</div>'; // Body close

            list.innerHTML += html;
            elements.devLists.appendChild(list);
        };        
    }

    
    // Add a card to the list
    List.prototype.addCard = function() {

    };

    // Remove a card from the list
    List.prototype.removeCard = function() {
        
    };

    var pendingRequests = [];
    var renderQueue = [];
    // If data for all users has been queued, render each list
    function render() {
        console.log('render:' + renderQueue.length);
        console.log('usernames:' + usernames.length);
        if (renderQueue.length === usernames.length) {
            console.log('all queued for render');
            for (var j = 0; j < renderQueue.length; j++) {
                var renderItem = renderQueue[j];
                renderItem.list.generateHTML(renderItem.data);
            }

            // Hide loader
            if (!elements.loader.classList.contains('hidden')) {
                elements.loader.classList.add('hidden');
            }
        }
    }
    function successCb(list, data, user) {
        var cards = data[1];
        var boardsToLoad = [];

        // Loop through the cards and look for new board IDs
        // If the ID is new, make a request to the Trello API and map the ID to the board name
        // This name will be used when rendering the cards
        for (var i = 0; i < cards.length; i++) {
            (function() {
                var boardID = cards[i].idBoard;
                if (!boardNameMap[boardID]) {
                    // Set an inital value so we know the AJAX request has been made
                    boardNameMap[boardID] = true;
                    pendingRequests.push(boardID);
                    // Push the endpoint URL
                    boardsToLoad.push('/boards/' + boardID);
                }
            }());
        }


        // Make API requests for every board ID we don't have data on
        if (boardsToLoad.length) {
            makeTrelloAPIRequests(boardsToLoad).then(function(result) {
                for (var i = 0; i < result.length; i++) {
                    // For each board, map name to boardNameMap object
                    var board = result[i],
                        boardID = board.id,
                        boardName = board.name,
                        boardUrl = board.url;

                    // Remove ID from pending requests
                    var idx = pendingRequests.indexOf(boardID);
                    pendingRequests.splice(idx, 1);

                    // Map the board name to the ID
                    boardNameMap[boardID] = boardName;
                }
                
                renderQueue.push({
                    list: list, 
                    data: data
                });
                render();
            });
        } else {
            renderQueue.push({
                list: list, 
                data: data
            });
            render();
        }    
    }


    function errorCb(list, error) {
    }


    function createNewList(user) {
        var name = nameMap[user];

        // Create a list component for this user
        var list = new List(user);

        // Make list API global for this user
        users[user] = list;
        
        if (cachedData.users[user]) {
            console.log('user ' + user + ' is cached');
            successCb(list, cachedData.users[user].result, user);
        } else {
            makeTrelloAPIRequests([
                'members/' + user, 
                'members/' + user + '/cards'
            ]).then(function(result) {
                console.log('API request success for: ' + name);
                console.log(cachedData);
                // Save data for later use
                cachedData.users[user] = {
                    memberObject: result[0],
                    cards: result[1],
                    result: result
                };
                
                // call success callback
                successCb(list, result, user);
            });
        }

    }



    function populateBoard() {
        for (var i = 0; i < usernames.length; i++) {
            createNewList(usernames[i]);
        }
    }

    /* ---------------------------------
     Board view
    --------------------------------- */
    var teams = (function() {
        var obj = {
            'Team Nemo': ['damianuc', 'joshuc', 'chrisuc', 'robertuc', 'emilyuc', 'daviduc'],
            'Team Avengers': ['lewisuc', 'sarahuc', 'rebeccauc', 'hazeluc', 'oliviauc', 'ryanuc', 'danuc', 'chriswuc'],
            'Team Skywalker': ['scottuc', 'bilaluc', 'sambuc', 'samuc', 'carrieuc'],
            'Development': ['damianuc', 'joshuc', 'lewisuc', 'sarahuc', 'rebeccauc', 'scottuc', 'bilaluc'], 
            'Strategy': ['daviduc', 'ryanuc', 'carrieuc'], // To add: Ammo
            'Research': ['chrisuc', 'hazeluc', 'oliviauc', 'sambuc', 'carrieuc'],
            'Analytics': ['samuc', 'robertuc', 'ryanuc', 'danuc', 'chriswuc'], // To add: Adam
            'Account Management': ['emilyuc'], // To add: Alex
            'Operations': ['bethuc'],
        };
    
        obj.All = (function() {
            var all = Array.prototype.concat(obj.Development, obj.Strategy, obj.Research, obj.Analytics, obj.Operations);

            // Remove duplicate names
            all = all.filter(function(val, idx, arr) {
                return arr.indexOf(val) === idx;
            });
            return all;
        }());

        return obj;
    })();

    // Create board changer
    var boardChanger = (function() {
        var select = document.createElement('select');
        select.id = 'change-board';

        for (var team in teams) {
            var option = document.createElement('option');
            option.value = team;
            option.innerText = team;
            select.appendChild(option);
        }
        
        document.querySelector('header').appendChild(select);
        $(select).on('change', function() {
            var val = this.value;

            // Clear page and empty vars
            $('#dev-lists').empty();
            renderQueue = [];
            pendingRequests = [];

            // Repopular with new user group
            usernames = teams[val];
            populateBoard();

            // Update board title
            document.querySelector('header h1').innerText = val + ' Taskboard';
            document.querySelector('title').innerText = val + ' Taskboard - User Conversion';

            // Set cookie
            setCookie('Taskboard_view', val);
        });

        return select;
    }());

    // Run initial board view
    var initialLoad = (function() {
        var cookie = getCookie('Taskboard_view');
        var val = cookie ? cookie : 'All';

        $('#change-board').val(val);
        usernames = teams[val];
        populateBoard();

        // Update board title
        document.querySelector('header h1').innerText = val + ' Taskboard';
        document.querySelector('title').innerText = val + ' Taskboard - User Conversion';
    }());


}(window.jQuery));