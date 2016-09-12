window.onload = function() {

    var ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = function () {
        console.log('open');

    var msgButton = document.getElementById('msg-form'),
        nameButton = document.getElementById('name-form'),
        leaveButton = document.getElementById('leave');
        privateReveal = document.getElementById('private-msg-display');
        msg = document.getElementById('msg'),
        usernameEl = document.getElementById('username'),

        //post messages to chat
       msgButton.addEventListener('submit', function(e){
            e.preventDefault();
            ws.send(JSON.stringify({type: "user-message", data: msg.value}));
            msg.value='';
            return false;
        });

       //login to chat w/alias otherwise default to 'guest'
       nameButton.addEventListener('submit', function(e){
            e.preventDefault();
            ws.send(JSON.stringify({type: "name", data: username.value}));
            username.value='';
            return false;
        });

       //show who is typing
       msg.addEventListener('input', function(e) {
            ws.send(JSON.stringify({type:"typing", data: name}));
           msg.removeEventListener('input', null);
        }) 

       msg.addEventListener('keyup', function(e) {
            ws.send(JSON.stringify({type: "not typing", data: name}));
       });

       //leave chat & notify other users
       leaveButton.addEventListener('click', function(){
            ws.send(JSON.stringify({type:"leave"}));
       });

       //toggle private message form visibility
        var form = document.getElementById('private-msg-form'); 

       privateReveal.addEventListener('click', function(){
            return form.className === 'hidden' ? form.className = 'visible' : form.className = 'hidden';
       });

       //TODO add function addChatMessage
       function addChatMessage(msg) {
            document.getElementById('all-msg').insertAdjacentHTML('beforeend', '<span class='+ msg.type +'>' + msg.data + '</span></br>');
       }

       //send a private message
        var privBtn = document.getElementById('privmsg-btn');   

        privBtn.addEventListener('click', function(e) {
            e.preventDefault();

            var to = document.getElementById('privTo').value, 
                text = document.getElementById('privMsg').value;

            //send pm    
            ws.send(JSON.stringify({type: "private message", data: {who: to, body: text}}));

            //reset the form 
            document.getElementById('privTo').value = '';
            document.getElementById('privMsg').value = '';

            form.className = 'hidden';
        });

       //handle incoming messages from server
        ws.onmessage = (function incoming(msg) {
            var msg = JSON.parse(msg.data);

            switch(msg.type) {
                case "numUsers":
                    var count = document.getElementsByTagName('h6')[0];
                    var updated = count.innerText;
                    return count.innerText = updated.replace(/\d/, msg.data);
                    break;

                case "loggedIn":
                    var activeMembersEl = document.getElementById('activeUsers');

                    var activeMembers = msg.data.map(function (user) {
                        return user.username;
                    });

                    return activeMembersEl.innerText = "Active members: " + activeMembers.toString();
                    break;

                case "msgs":
                    addChatMessage(msg);
                    break;

                case "name":

                    if (msg.data !== "Guest") {
                        document.getElementById('name-form').style.visibility='hidden';
                    } else {
                        document.getElementById('name-form').style.visibility='visible';
                    }

                    break;

                //show when users are typing
                case "typing":
                    var user = msg.data;
                    var allMsg = document.getElementById('all-msg');
                    var startTime = new Date().getTime();

                    allMsg.insertAdjacentHTML('beforeend', '<span class="typing">' + user + " is typing..." + '</span>');
                    break;  

                    //setTimeout(function () {
                  //       var typingTimer = (new Date()).getTime();
                  //       var timeDiff = typingTimer - lastTypingTime;
                  //       if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
                  //         socket.emit('stop typing');
                  //         typing = false;
                  //       }
                  //     }, TYPING_TIMER_LENGTH);
                  //   }
                  // }

                case "not typing":
                    var children = document.getElementById('all-msg').children;

                    for (var i = 0; i < children.length;i++) {
                        if(children[i].className === "typing" || children[i].tagName === "BR") {
                           children[i].remove();
                        }
                    }
                break;

                case 'private message':
                    console.log("received");
                    console.log(msg);
                    alert("You have a private message");

                    document.getElementById('private-container').insertAdjacentHTML('beforeend', '<span class="msgs">' + msg.from + ": " + msg.text + '</span></br>');
                break;

                case "chatHistory":
                    var allMsg = document.getElementById('all-msg');
                    for(var i = 0; i<msg.data.length; i++) {
                        msg = JSON.parse(msg.data[i]);
                        allMsg.insertAdjacentHTML('beforeend', '<span class="msgs">' + msg.username + ": " + msg.msg + '</span></br>');
                    }
                    break;

                case "exit":
                    addChatMessage(msg);
                    break;
            }
        });
    };
};