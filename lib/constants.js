Timer = {};

Timer.interval = null;
Timer.isStarted = false; 
Timer.isPaused = false; 
Timer.onBreak = false;
Timer.delay = 1000;
Timer.now = new Date();
Timer.before = new Date();