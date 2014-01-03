(function(){

    var UP = 38;
    var DOWN = 40;
    var LEFT = 37;
    var RIGHT = 39;
    var SPEED = 1;

    var move;

    var canvas = document.querySelector('canvas');

    var context = canvas.getContext('2d');

    var width = canvas.width;

    var height = canvas.height;

    var SIZE = canvas.width / 16;

    var frame;

    var RECT;

    var SNAKE;

    var FOOD;

    var score = 0;

    var scoreHolder = document.getElementById('score');

    var isDefined = function(o){
      return o !== void(0);
    };

    var Snake = function(boundaryRect){
        this.direction = RIGHT;
        this.parts = [];
        var i = 5;
        while(i--){
          this.parts.push({
            x: i * SIZE,
            y: 0
          });
        }
        this.boundaryRect = boundaryRect;
    };

    Snake.prototype.addPart = function(){
      this.move(true);
    };

    Snake.prototype.move = function(eat){
      var head = this.parts[0];
      var tail = eat ?  {x:0,y:0} : this.parts.pop();
      var x = head.x;
      var y = head.y;
      switch(this.direction){
        case UP:
          y -= SIZE;
        break;
        case DOWN:
          y += SIZE;
        break;
        case LEFT:
          x -= SIZE;
        break;
        case RIGHT:
          x += SIZE;
        break;
      }
      tail.x = x;
      tail.y = y;
      this.parts.unshift(tail);
    };

    Snake.prototype.draw = function(context){
        var part;
        for (var i = this.parts.length - 1; i >= 0; i--) {
          part = this.parts[i];
          context.fillStyle = "#FFF";
          context.fillRect(part.x, part.y, SIZE, SIZE);
        }
    };

    Snake.prototype.collision = function(x, y){
        var part;
        var count = 0;
        if(!isDefined(x)){
          var head = this.parts[0];
          x = head.x;
          y = head.y;
          count = 1;
        }
        for (var i = this.parts.length - 1; i >= count; i--) {
          part = this.parts[i];
          if(part.x == x && part.y == y){
            return true;
          }
        }
        return false;
    };

    Snake.prototype.inside = function(rect){
      var head = this.parts[0];
      if(rect.inside(head.x, head.y, SIZE, SIZE)){
        return true;
      }
      return false;
    };

    Snake.prototype.didEat = function(food){
      var head = this.parts[0];
      return food.x == head.x && food.y == head.y;
    };

    var Rect = function(x, y, w, h){
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
    };

    Rect.prototype.inside = function(x, y, w, h){
      return this.inY(y, h) && this.inX(x, w);
    };

    Rect.prototype.inX = function(x, w){
      if(x >= this.x && x + w <= this.x + this.w){
        return true;
      }
      return false;
    };

    Rect.prototype.inY = function(y, h){
      if(y >= this.y && y + h <= this.y + this.h){
        return true;
      }
      return false;
    };

    var Food = function(){
      this.reset();
      while(SNAKE.collision(this.x, this.y)){
        this.reset();
      }
    };

    Food.prototype.reset = function(){
      var max = ~~(width / SIZE);
      this.x = ~~(Math.random() * max) * SIZE;
      this.y = ~~(Math.random() * max) * SIZE;
    };

    Food.prototype.draw = function(context){
      context.beginPath();
      context.fillStyle = "#F00";
      context.fillRect(this.x, this.y, SIZE, SIZE);
      context.strokeStyle = '#FFF';
      context.lineWidth = 5;
      context.stroke();
      context.closePath();
    };

    var HighScores = {
      table: null,
      get: function(){
        var s = localStorage.getItem('HighScores');
        return s ? JSON.parse(s) : [];
      },
      add: function(score){
        if(!score)
          return;

        var hs = HighScores.get() || [];
        hs.push(score);
        hs.sort(function (a, b) {
          if (a > b)
            return -1;
          if (a < b)
            return 1;
          // a must be equal to b
          return 0;
        });
        if(hs.length > 10){
          hs.pop();
        }
        console.log(hs);
        HighScores.save(hs);
        HighScores.display(hs);
      },
      save: function(hs){
        localStorage.setItem('HighScores', JSON.stringify(hs ? hs : []));
      },
      display: function(hs){
        hs = hs || HighScores.get();
        table = HighScores.table || document.createElement('table');
        table.innerHTML = "";
        table.className = 'highscores';
        var html = '<tr><th>High Scores</th></tr><tr><td>' + hs.join('</td></tr><tr><td>') + '</td></tr>';
        table.innerHTML = html;
        document.body.appendChild(table);
        console.log(html);
        HighScores.table = table;
      }
    };


    var init = function(){
      RECT = new Rect(0, 0, width, height);
      SNAKE = new Snake();
      FOOD = new Food();
      numFlashes = 0;
      score = 0;
      scoreHolder.innerText = '';
      if(frame){
        clearTimeout(frame);
      }
      if(flasher){
        clearTimeout(flasher);
      }
      HighScores.display();
    };

    var flasher;
    var numFlashes = 0;
    var flash = function(){
      if(numFlashes < 6){
         context.clearRect(0,0,width,height);
         if(numFlashes%2){
          SNAKE.draw(context);
         }
         flasher = setTimeout(flash, 1000/6);
         numFlashes++;
      }else{
        //init();
      }

    };

    var draw = function drawF(){
        context.clearRect(0,0,width,height);
        if(SNAKE.didEat(FOOD)){
          SNAKE.move(true);
          FOOD = new Food();
          FOOD.draw(context);
          score++;
          scoreHolder.innerText = 'Score: ' + score;
        }else{
          SNAKE.move();
          FOOD.draw(context);
        }

        if(!!move){
          SNAKE.direction = move;
          move = false;
        }
        if(!SNAKE.collision() && SNAKE.inside(RECT)){
          SNAKE.draw(context);
        }else{
          console.log('Game Over!');
          HighScores.add(score);
          flash();
          return;
        }
        frame = window.setTimeout(draw, 1000/12);
    };



    document.addEventListener('keydown', function(e){
        var key = e.which;
        if((key == UP && SNAKE.direction != DOWN) ||
           (key == LEFT && SNAKE.direction != RIGHT) ||
           (key == RIGHT && SNAKE.direction != LEFT) ||
           (key == DOWN && SNAKE.direction != UP)){
          move = key;
        }
        //clearTimeout(frame);
        //draw();
    });

    document.querySelector('button').addEventListener('click', function(e){
      init();
      draw();
    });


})();
