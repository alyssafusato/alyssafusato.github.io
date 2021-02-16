//////////////////////////////////////
//  StarBird, side-scrolling browser game 
//  Jude, Alyssa
//  Purpose: Main code for the game
//////////////////////////////////////

var obstacles = []; //Array for rock objects(also referred to as asteroids)
var loopDelay = 16; //Sets game loop to run every 16 miliseconds
var rockRadius = 25; //Sets a static radius for rock objects
var rockDamage = 1; //Indicates how much damage rocks deplete when hit
var baseFontSize = $("body").css("font-size");
var timeBetweenAsteroids = 500; //Sets the time between attempts to generate asteroids in milliseconds

/*  gameState object keeps information about the current game for 
    other functions to reference, such as how many asteroids to 
    generate, when to display the nest or if other objects are active*/
var gameState = {
    level: 5,
    timer: 0, /*loop iterations*/
    active: false,
    activeObst: 0,
    activeNest: 0,
    levelEnd: 800,
    invulnerable: false,
};

//Distances in pixels
//Container for static bird information
var bird = {
    height: 0,
    radius: 0,
    width: 0,
    healthMax: 5,
    healthCurrent: 0,
}

var nest = { /* added from nest.js */
    radius: 10,
    speed: 0,
    active: 0,
};

var gameLoopInterval;

/*  Displays the start splashscreen with game control instructions and a button to 
    start the game*/
$(document).ready(
    function () {
        var startBtn = "Start";
        var startText = "<div class=\"splashtext\">Use the arrow keys to steer the bird away from asteroids. Reach the bird's space ship to win!</div>";
        gamescreen(startBtn, startText);
    }
);

/*  Splashscreen that appears once the game win/lose. Displays overlay, message,
    and a start button that resets and runs the game*/
function gamescreen(buttontext, splashtext) {

    /*var $img = $("<div>");*/ //for splashscreen pictures, implement if time 
    var $startscreen = $("<div>");
    $startscreen.attr("id", "splashscreen");
    $startscreen.attr("class", "splashscreen");
    $startscreen.html(splashtext);

    var $button = $("<div>");
    $button.attr("id", "startbutton");
    $button.addClass("startbutton");
    $button.attr("tabindex", "1");
    $button.html(buttontext);
    kd.ENTER.down = function () {
        $("#startbutton").focus();
        window.setTimeout(function () {
            $("#startbutton").click();
        }, 300);
    }
    $button.on("click", function () {
        $button.css("border", "5px solid #3847ce");
        gameReset();
        $button.parent().css("display", "none");
        gameRun();
        $button.parent().remove();
    });

    $startscreen.append($button);
    $startscreen.appendTo($("#gameBox"));
}

/*  Destroys objects created after gameRun() is executed.
    Reusing leftover objects causes problems*/
function gameReset() {
    var $nest = $("#nest");
    if ($nest) {
        $nest.css("display", "none");
        $nest.remove();
    }
    var $bird = $("#bird");
    if ($bird) {
        $bird.css("display", "none");
        /*When bird is removed here, keyboard input after splashscreen 
        is displayed as an error, but the bird's repositioning problem
        after retry/play again is fixed*/
    }
    var $rock = $(".rock");
    $rock.each(function () {
        $(this).css("display", "none");
        $(this).remove();
    });
    var $lives = $("#lives");
    $lives.each(function () {
        $(this).css("display", "none");
        $(this).remove();
    });
    bird.healthCurrent = bird.healthMax;
    gameState.timer = 0;
    clearInterval(gameLoopInterval);
}

/*  Sets up the bird(player) and background elements for the game.
    Starts the loop and checks to see if the bird and bg already
    exist (from retry/play again) before creating new ones*/
function gameRun() {
    //make bird element
    var $birdMom = $("#gameBox");
    var $bird = $("#bird");
    if ($bird.length == 0) {
        $bird = $("<div>");
        $bird.attr("id", "bird");
        $bird.attr("class", "bird");
        $birdMom.append($bird);
    }

    $bird.css("top", $birdMom.position().top);
    $bird.css("left", $birdMom.position().left);
    $bird.css("display", "inline");
    //Set static bird information
    bird.height = $bird.height();
    bird.width = $bird.width();
    bird.radius = Math.min(bird.height, bird.width) / 2;


    generateToggles();

    //Add the galaxy backdrop
    var $backgroundMom = $("#gameBox");
    var $galaxyGraphics = $(".sliding-galaxies");
    if ($galaxyGraphics.length == 0) {
        $galaxyGraphics = $("<div>");
        $galaxyGraphics.attr("id", "sliding-galaxies");
        $galaxyGraphics.attr("class", "sliding-galaxies");

        $galaxyGraphics.appendTo($backgroundMom);
    }
    gameState.active = true;
    gameLoopInterval = setInterval(gameLoop, loopDelay);
}

/*  Stops the game, calls gameReset() and displays the 'lose' splashscreen */
function gameLose() {
    gameState.active = false;
    gameReset();
    var startBtn = "Retry";
    var startText = "<div class=\"splashtext\">You died :(</div>";
    gamescreen(startBtn, startText);
}

/*  The heartbeat of the game; gameLoop() calls the necessary functions 
    to create and destroy objects and keep them updated.*/
function gameLoop() {
    if (gameState.active) {
        generateAsteroids();
        generateNest();
        destroyInactiveAsteroids();
        detectCollision();
        gameState.timer++;
    }
}

/*  Creates nest(UFO) if the level has run for a certain length
    of time, as indicated by gameState.levelEnd*/
function generateNest() {
    if (gameState.timer == gameState.levelEnd) {
        var $nestMom = $("#gameBox");
        var $nest;
        $nest = $("<div>");
        $nest.attr("id", "nest");
        $nest.attr("class", "nest");
        $nest.css("top", $nestMom.position().top + 5);
        $nestMom.append($nest);
    }
}

/*  Creates asteroid divs and assigns them css values and attributes.
    Also creates numbered Ids for them and gives them a speed value */
function generateAsteroids() {
    /*
       if (gameState.timer % 600 === 0) {
           var numRocks = gameState.level;
           var $rockMom = $("#gameBox");
           var $rock;
           var portHeight = $rockMom.height();
           var portTop = $rockMom.position().top;
           var rockVerticalGap = portHeight / numRocks;
           for (var ndx = 0; ndx < numRocks; ndx++) {
               $rock = $("<div>");
               $rock.attr("id", "rock" + ndx);
               $rock.attr("class", "rock");
               $rock.css("top", ndx * rockVerticalGap + portTop);
               $rock.css("animation-duration", Math.random() * 5 + 1 + "s");
               $rockMom.append($rock);
           }
       }
       */
    ///*
    //every half second, check to see if we should generate asteroids
    //TODO: Extract target and timing
    //The base chance of getting an asteroid is based on the game's current level
    var chanceOfAsteroid = gameState.level / 20;
    //Uncomment the following line to turn off asteroid generation. Useful for debugging.
    //chanceOfAsteroid = 0;

    //Modify the base chance by the distance travelled.
    //This formula should double the chance of an asteroid as the player approaches the end of the level.
    var distanceFactor = 2 - Math.floor((gameState.levelEnd - gameState.timer) / gameState.levelEnd);
    if (distanceFactor > 2) {
        distanceFactor = 2;
    }
    chanceOfAsteroid *= distanceFactor;
    console.log("Final chance of asteroid: " + chanceOfAsteroid);
    var $rockMom = $("#gameBox");
    var portHeight = $rockMom.height();
    var portTop = $rockMom.position().top;
    var ticksBetweenAsteroids = Math.ceil(timeBetweenAsteroids / loopDelay);
    if (gameState.timer % ticksBetweenAsteroids === 0) {
        console.log("Chance of asteroid: " + chanceOfAsteroid + " ticks between asteroids: " + ticksBetweenAsteroids);
        //Roll to see if we successfully generate an asteroid
        //Initially, the percentage chance is just ten times the level
        var success = Math.random() <= chanceOfAsteroid;
        var ndx = 0;
        while (success) {
            //Create an asteroid
            var $rock = $("<div>");
            $rock.attr("id", "rock" + ndx);
            $rock.attr("class", "rock");
            var rockRadius = $rock.height() / 2;
            var rockTopOffset = Math.random() * (portHeight - rockRadius);
            $rock.css("top", portTop + rockTopOffset);
            $rock.css("animation-duration", Math.random() * 5 + 1 + "s");
            $rockMom.append($rock);
            ndx++;
            //reroll for another asteroid
            success = Math.random() <= chanceOfAsteroid;
        }
    }
    //*/
}

/*  Checks for collisions every game loop. Checks all rocks
s   onscreen and the nest(UFO) if the level's time has run long enough*/
function detectCollision() {
    $(".rock").each(doesRockOverlapBird);
    if (gameState.timer >= gameState.levelEnd) {
        hasBirdReachedNest();
    }
}

/*  Finds the bird's location and the location of every
    asteroid onscreen and passes them to overlapRadial
    to check for collisions. */
function doesRockOverlapBird() {
    var rockPos = $(this).position();
    var rockLeft = rockPos.left;

    var rockTop = rockPos.top;
    var rockCenterX = rockLeft + rockRadius;
    var rockCenterY = rockTop + rockRadius;
    var $bird = $("#bird");

    var birdLeft = $bird.position().left;
    var birdTop = $bird.position().top;
    var birdCenterX = birdLeft + bird.width / 2;
    var birdCenterY = birdTop + bird.height / 2;

    var collide = overlapRadial(birdCenterX, birdCenterY, rockCenterX, rockCenterY, bird.radius, rockRadius);

    /*  If overlapRadial indicates a collision, the hitBird function is called,
        the offending rock's div is removed and the rockSmash div is generated 
        and subsequently destroyed to briefly display the shattering animation */
    if (collide) {
        $(this).remove();
        var $rockShatter = $("<div>");
        $rockShatter.css("top", rockTop);
        $rockShatter.css("left", rockLeft);
        $rockShatter.attr("class", "rockSmash");
        $rockShatter.appendTo($("#gameBox"));

        window.setTimeout(function () {
            $rockShatter.remove();
        }, 300);
        hitBird(rockDamage);
    }
}

/*  Checks the nest(UFO)'s horizontal with bird's and ends the game
    as a win if the bird has reached the nest. Resets and presents
    splash screen */
function hasBirdReachedNest() {

    var $nest = $("#nest");
    var nestX = $nest.position().left;
    var nestWidth = $nest.width();
    var nestCenter = nestX + (nestWidth / 2);

    var $bird = $("#bird");
    var birdX = $bird.position().left;
    var birdWidth = $bird.width();
    var birdCenter = birdX + (birdWidth / 2);

    if (birdCenter >= nestCenter) {
        gameState.active = false;
        gameReset();
        var startBtn = "Play again (with more asteroids)";
        var startText = "<div class=\"splashtext\"> You didn't died :) </div>";
        gamescreen(startBtn, startText);
    }
}

/*  Gets rid of rock divs that have left the screen so they don't
    accumulate and eat the CPU alive */
function destroyInactiveAsteroids() {
    $(".rock").each(function () {
        $this = $(this);
        var rockPos = $this.position();
        var rockLeft = rockPos.left;
        if (rockLeft + rockRadius + rockRadius <= 0) {
            this.remove();
        }
    });
}

/* Ends the game if the bird's current health is zero or less */
function updateBird() {
    updateLives();
    if (bird.healthCurrent <= 0) {
        gameLose();
    }
}

/*  Checks the area of bird and rock to see if they overlap,
    causing the function to indicate a collision. Radial detection.  */
function overlapRadial(x1, y1, x2, y2, radius1, radius2) {
    var xdist = x1 - x2;
    var ydist = y1 - y2;
    var xdistSquared = xdist * xdist;
    var ydistSquared = ydist * ydist;
    var distance = Math.sqrt(xdistSquared + ydistSquared);
    var sumRad = radius1 + radius2;
    return distance < sumRad;
}

function hitBird(damage) {
    if (gameState.invulnerable === false) {
        bird.healthCurrent -= damage;
        document.getElementById("bird").style.backgroundImage = 'url("../assets/images/starbird/bird_flapinj.gif")';
        gameState.invulnerable = true;
        window.setTimeout(function () {
            document.getElementById("bird").style.backgroundImage = 'url("../assets/images/starbird/bird_flap.gif")';
            gameState.invulnerable = false;
        }, 400);
        updateBird();
    }

}

function generateLives() {
    var $livesMom = $("#healthBar");
    var $lives = $("<div>");
    $lives.attr("id", "lives");
    $lives.attr("class", "lives");
    $lives.html(bird.healthCurrent);
    $livesMom.append($lives);
}

function updateLives() {
    $lives = $(".lives");
    $lives.html(bird.healthCurrent);
}

function generateToggles() {
    generateLives();
    
    var $speedWrap = $(".speedWrap");
    $speedWrap.attr("class", "number-input");
    $speedWrap.html("<span>Bird<br>Speed</span><button onclick=\"this.parentNode.querySelector('input[type=number]').stepDown()\" ></button><input id=\"speedValue\" class=\"quantity\" min=\"0\" name=\"quantity\" value=\"1\" type=\"number\"><button onclick=\"this.parentNode.querySelector('input[type=number]').stepUp()\" class=\"plus\"></button>");
}

function checkSpeed() {
    var $speedWrap = $(".speedWrap");
    var $speed = $speedWrap.value();
}