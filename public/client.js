window.onload = function() {

    var ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = function () {
        console.log('open');

    var msgButton = document.getElementById('msg-form'),
        nameButton = document.getElementById('name-form'),
        msg = document.getElementById('msg'),
        usernameEl = document.getElementById('username'),
        leave = document.getElementById('leave');

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
       // msg.addEventListener('input', function(event) {
       //  console.log(event);
       //      ws.send(JSON.stringify({type:"typing", data: name}));
       //      // if (this.compositionend === true) {

       //      // }
       //  })

       //leave chat & notify other users
       leave.addEventListener('click', function(){
            ws.send(JSON.stringify({type:"leave"}));
       });

       var user = {};
       user.username = "Guest";

       //handle incoming messages from server
        ws.onmessage = (function incoming(msg) {
            var msg = JSON.parse(msg.data);

            switch(msg.type) {

                case "numUsers":
                    var count = document.getElementsByTagName('h6')[0];
                    var updated = count.innerText
                    return count.innerText = updated.replace(/\d/, msg.data);
                    break;
                case "loggedIn":
                    var activeMembersEl = document.getElementById('activeUsers');

                    var activeMembers = msg.data.map(function(user){
                        return user.username;
                    })

                    return activeMembersEl.innerText = "Active members: " + activeMembers.toString();
                    break;
                case "text":
                    document.getElementById('all-msg').insertAdjacentHTML('beforeend', '<span class="msgs">' + msg.data + '</span></br>');
                    break;
                case "name":
                    user.username = msg.data;
                    user.id = msg.id;

                    if (msg.data.username !== "Guest") {
                        document.getElementById('name-form').style.visibility='hidden';
                    } else {
                        document.getElementById('name-form').style.visibility='visible';
                    }

                    document.getElementById('all-msg').insertAdjacentHTML('beforeend', '<span class="msgs">' + user.username + ' entered the chat.'+'</span></br>');
                    break;
                //show when users are typing
                case "typing":
                    var allMsg = document.getElementById('all-msg');
                    
                    if (msg.data) {
                        var newMsg = allMsg.insertAdjacentHTML('beforeend', '<span class="typing">' + msg.data + " is typing..." + '</span></br>');
                        // newMsg.show
                    } else {
                        // .hide
                    }
                    break;                
                case "chatHistory":
                    var allMsg = document.getElementById('all-msg');

                    for(var i = 0; i<msg.data.length; i++) {
                        msg = JSON.parse(msg.data[i]);
                        allMsg.insertAdjacentHTML('beforeend', '<span class="msgs">' + msg.username + ": " + msg.msg + '</span></br>');
                    }
                    break;
                case "exit":
                    document.getElementById('all-msg').insertAdjacentHTML('beforeend', '<span class="msgs">' + msg.data + '</span></br>');
                    break;
            }
        });
    };
};