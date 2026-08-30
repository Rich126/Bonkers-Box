window.SPENCER_LIVE_CREATIVE = {
  id: 'creative-party',
  name: 'Creative Party',
  description: 'Picture, sound and impression challenges with family voting.',
  rounds: [
    {
      id: 'classic-picture-lottery',
      kind: 'picture',
      title: 'Picture Challenge',
      prompt: "Take a picture of you looking like... YOU'VE JUST WON THE LOTTERY!",
      captureSeconds: 60
    },
    {
      id: 'classic-sound-car',
      kind: 'sound',
      title: 'Sound Challenge',
      prompt: "Mimic the sound of... A CAR THAT REALLY DOESN'T WANT TO START!",
      captureSeconds: 45
    },
    {
      id: 'classic-impression-player',
      kind: 'sound',
      creativeType: 'impression',
      impressionTarget: 'player',
      title: 'Player Impression',
      prompt: 'Do your best impression of another player!',
      promptTemplates: [
        'Do your best impression of {player} CELEBRATING A HUGE WIN!',
        'Do your best impression of {player} trying to get out of DOING CHORES!',
        'Do your best impression of {player} ordering the most ridiculous TAKEAWAY!',
        'Do your best impression of {player} when somebody changes the TV channel!',
        'Do your best impression of {player} trying to explain why they are LATE!'
      ],
      captureSeconds: 50,
      recordSeconds: 15
    },
    {
      id: 'classic-impression-attenborough',
      kind: 'sound',
      creativeType: 'impression',
      title: 'Celebrity Impression',
      prompt: 'Do your best DAVID ATTENBOROUGH impression narrating someone opening a packet of crisps.',
      captureSeconds: 50,
      recordSeconds: 15
    },
    {
      id: 'classic-impression-ramsay',
      kind: 'sound',
      creativeType: 'impression',
      title: 'Celebrity Impression',
      prompt: 'Do your best GORDON RAMSAY impression reviewing beans on toast.',
      captureSeconds: 50,
      recordSeconds: 15
    },
    {
      id: 'classic-impression-player-2',
      kind: 'sound',
      creativeType: 'impression',
      impressionTarget: 'player',
      title: 'Player Impression',
      prompt: 'Do your best impression of another player!',
      promptTemplates: [
        'Do your best impression of {player} finding out they have WON THE LOTTERY!',
        'Do your best impression of {player} giving a VERY SERIOUS press conference!',
        'Do your best impression of {player} discovering there is NO WIFI!',
        'Do your best impression of {player} trying to stay calm in a traffic jam!',
        'Do your best impression of {player} announcing the winner of Spencer Games!'
      ],
      captureSeconds: 50,
      recordSeconds: 15
    }
  ],
  mixRounds: [
    {id:'mix-pic-superhero',kind:'picture',title:'Picture Challenge',prompt:'Take a picture of your best SUPERHERO POSE!',captureSeconds:60},
    {id:'mix-sound-animal',kind:'sound',title:'Sound Challenge',prompt:'Make the funniest ANIMAL NOISE you can!',captureSeconds:45},
    {id:'mix-pic-shocked',kind:'picture',title:'Picture Challenge',prompt:'Take a picture of you looking COMPLETELY SHOCKED!',captureSeconds:60},
    {id:'mix-sound-robot',kind:'sound',title:'Sound Challenge',prompt:'Do your best ROBOT VOICE saying: Spencer Games!',captureSeconds:45},
    {id:'mix-pic-villain',kind:'picture',title:'Picture Challenge',prompt:'Take a picture of your most dramatic VILLAIN FACE!',captureSeconds:60},
    {id:'mix-sound-dinosaur',kind:'sound',title:'Sound Challenge',prompt:'Make your best DINOSAUR ROAR!',captureSeconds:45},
    {id:'mix-pic-slowmo',kind:'picture',title:'Picture Challenge',prompt:'Freeze in a pose that looks like you are running in SLOW MOTION!',captureSeconds:60},
    {id:'mix-sound-commentator',kind:'sound',title:'Sound Challenge',prompt:'Give a 10-second SPORTS COMMENTARY for the most ridiculous race ever!',captureSeconds:45},
    {id:'mix-pic-statue',kind:'picture',title:'Picture Challenge',prompt:'Become the strangest HUMAN STATUE you can!',captureSeconds:60},
    {id:'mix-sound-alien',kind:'sound',title:'Sound Challenge',prompt:'What would an ALIEN sound like ordering a pizza?',captureSeconds:45},
    {id:'mix-pic-tiny',kind:'picture',title:'Picture Challenge',prompt:'Pose like you have just seen something TINY but TERRIFYING!',captureSeconds:60},
    {id:'mix-sound-movie',kind:'sound',title:'Sound Challenge',prompt:'Make a dramatic MOVIE TRAILER voice for your breakfast!',captureSeconds:45},
    {id:'mix-pic-racing',kind:'picture',title:'Picture Challenge',prompt:'Take a picture like you are celebrating a huge MOTOR RACING WIN!',captureSeconds:60},
    {id:'mix-sound-weather',kind:'sound',title:'Sound Challenge',prompt:'Give a WEATHER REPORT for a completely bonkers planet!',captureSeconds:45},
    {id:'mix-pic-invisible',kind:'picture',title:'Picture Challenge',prompt:'Pose like you are wrestling an INVISIBLE MONSTER!',captureSeconds:60},
    {id:'mix-sound-laugh',kind:'sound',title:'Sound Challenge',prompt:'Do your most ridiculous EVIL LAUGH!',captureSeconds:45},
    {id:'mix-pic-moon',kind:'picture',title:'Picture Challenge',prompt:'Pose like you have just landed on THE MOON!',captureSeconds:60},
    {id:'mix-sound-game-show',kind:'sound',title:'Sound Challenge',prompt:'Be a GAME SHOW HOST announcing the silliest prize imaginable!',captureSeconds:45},
    {id:'mix-pic-fashion',kind:'picture',title:'Picture Challenge',prompt:'Strike your most outrageous FASHION MODEL pose!',captureSeconds:60},
    {id:'mix-sound-monster',kind:'sound',title:'Sound Challenge',prompt:'Make the sound of a tiny MONSTER trying to be scary!',captureSeconds:45},
    {id:'mix-pic-sneaky',kind:'picture',title:'Picture Challenge',prompt:'Take a picture of your best SNEAKING pose!',captureSeconds:60},
    {id:'mix-sound-space',kind:'sound',title:'Sound Challenge',prompt:'Make the sound of a SPACESHIP taking off using only your voice!',captureSeconds:45},
    {id:'mix-pic-celebrity',kind:'picture',title:'Picture Challenge',prompt:'Pose like you have just arrived on a huge RED CARPET!',captureSeconds:60},
    {id:'mix-sound-slow',kind:'sound',title:'Sound Challenge',prompt:'Say “I cannot believe that happened!” in the funniest SLOW-MOTION voice!',captureSeconds:45},

    {id:'mix-impression-player-win',kind:'sound',creativeType:'impression',impressionTarget:'player',title:'Player Impression',prompt:'Do your best impression of another player!',promptTemplates:['Do your best impression of {player} CELEBRATING A HUGE WIN!','Do your best impression of {player} finding out there is NO WIFI!','Do your best impression of {player} trying to get out of DOING CHORES!'],captureSeconds:50,recordSeconds:15},
    {id:'mix-impression-attenborough',kind:'sound',creativeType:'impression',title:'Celebrity Impression',prompt:'Do your best DAVID ATTENBOROUGH impression narrating someone making toast.',captureSeconds:50,recordSeconds:15},
    {id:'mix-impression-player-press',kind:'sound',creativeType:'impression',impressionTarget:'player',title:'Player Impression',prompt:'Do your best impression of another player!',promptTemplates:['Do your best impression of {player} giving a VERY SERIOUS press conference!','Do your best impression of {player} ordering a ridiculous TAKEAWAY!','Do your best impression of {player} announcing the Spencer Games winner!'],captureSeconds:50,recordSeconds:15},
    {id:'mix-impression-ramsay',kind:'sound',creativeType:'impression',title:'Celebrity Impression',prompt:'Do your best GORDON RAMSAY impression reviewing beans on toast.',captureSeconds:50,recordSeconds:15},
    {id:'mix-impression-beckham',kind:'sound',creativeType:'impression',title:'Celebrity Impression',prompt:'Do your best DAVID BECKHAM impression giving a half-time team talk about tidying your bedroom.',captureSeconds:50,recordSeconds:15},
    {id:'mix-impression-player-late',kind:'sound',creativeType:'impression',impressionTarget:'player',title:'Player Impression',prompt:'Do your best impression of another player!',promptTemplates:['Do your best impression of {player} explaining why they are LATE!','Do your best impression of {player} trying to stay calm in a traffic jam!','Do your best impression of {player} winning an award for BEST SNACK!'],captureSeconds:50,recordSeconds:15},
    {id:'mix-impression-taylor',kind:'sound',creativeType:'impression',title:'Celebrity Impression',prompt:'Do your best TAYLOR SWIFT impression accepting an award for the best packed lunch.',captureSeconds:50,recordSeconds:15},
    {id:'mix-impression-cowell',kind:'sound',creativeType:'impression',title:'Celebrity Impression',prompt:'Do your best SIMON COWELL impression judging the world’s most ridiculous talent act.',captureSeconds:50,recordSeconds:15}
  ]
};
