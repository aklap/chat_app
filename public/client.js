window.onload = function() {

    var ws = new WebSocket('ws://localhost:8080');
    
    ws.onopen = function (e) {
        console.log('open');

        var msgButton = document.getElementById('msg-form');
        var nameButton = document.getElementById('name-form');
        var msg = document.getElementById('msg');
        var username = document.getElementById('username');
        var leave = document.getElementById('leave');

       msgButton.addEventListener('submit', function(e){
            e.preventDefault();
            ws.send(JSON.stringify({type: "user-message", data: msg.value}));
            msg.value='';
            return false;
        });

       nameButton.addEventListener('submit', function(){
            e.preventDefault();
            ws.send(JSON.stringify({type: "name", data: username.value}));
            username.value='';
            return false;
        });

       leave.addEventListener('click', function(){
        ws.send(JSON.stringify({type:"leave"}));
       });

        ws.onmessage = (function incoming(msg) {
            var msg = JSON.parse(msg.data);

            if(msg.type === "text"){
                document.getElementById('all-msg').insertAdjacentHTML('afterbegin', '<span class="msgs">' + msg.data + '</span>');
            };

            if(msg.type === "name") {
                console.log("Name is: " + msg.data);
            }
        });

        ws.onclose= function(){
            console.log('closed');
            ws.send(JSON.stringify({type: "close", data: 'goodbye!'}));
        };
    };
};