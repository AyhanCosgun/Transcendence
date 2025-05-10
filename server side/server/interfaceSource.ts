// inputSource.ts
export interface InputSource {
    /**
     * Register a callback to be invoked when a new paddle position is available
     */
    onMove(callback: (position: number) => void): void;
    /**
     * Start listening to input events (keyboard or websocket)
     */
    start(): void;
    /**
     * Stop listening (cleanup)
     */
    stop(): void;
  }
  
  // localInputSource.ts
  import { InputSource } from './inputSource';
  
  export class LocalInputSource implements InputSource {
    private callback: (pos: number) => void = () => {};
    private position = 50; // initial paddle position (0-100)
    private handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        this.position = Math.max(0, this.position - 5);
        this.callback(this.position);
      } else if (e.key === 'ArrowDown') {
        this.position = Math.min(100, this.position + 5);
        this.callback(this.position);
      }
    };
  
    onMove(callback: (pos: number) => void): void {
      this.callback = callback;
    }
    start(): void {
      window.addEventListener('keydown', this.handleKey);
    }
    stop(): void {
      window.removeEventListener('keydown', this.handleKey);
    }
  }
  
  // remoteInputSource.ts
  import { InputSource } from './inputSource';
  
  export class RemoteInputSource implements InputSource {
    private callback: (pos: number) => void = () => {};
    private ws: WebSocket;
  
    constructor(wsUrl: string) {
      this.ws = new WebSocket(wsUrl);
      // when receiving a move from the other player
      this.ws.addEventListener('message', (ev) => {
        const msg = JSON.parse(ev.data);
        if (msg.type === 'move') {
          this.callback(msg.position);
        }
      });
    }
  
    onMove(callback: (pos: number) => void): void {
      this.callback = callback;
    }
  
    start(): void {
      // nothing extra needed; ws connects automatically
      this.ws.addEventListener('open', () => console.log('WS connected'));
    }
  
    stop(): void {
      this.ws.close();
    }
  
    /**
     * Send local move to remote peer
     */
    send(position: number): void {
      this.ws.send(JSON.stringify({ type: 'move', position }));
    }
  }
  
  // pongGame.ts
  import { InputSource } from './inputSource';
  
  export class PongGame {
    private paddlePos = 50;
    private ballX = 50;
    private ballY = 50;
    private ballVX = 1;
    private ballVY = 1;
  
    constructor(private input: InputSource) {}
  
    init() {
      // subscribe to paddle moves
      this.input.onMove((pos) => {
        this.paddlePos = pos;
      });
      this.input.start();
  
      // start main loop
      requestAnimationFrame(this.loop);
    }
  
    private loop = () => {
      // advance ball independent of input source
      this.ballX += this.ballVX;
      this.ballY += this.ballVY;
  
      // reflect off walls...
      if (this.ballY <= 0 || this.ballY >= 100) this.ballVY *= -1;
  
      // check paddle collision
      if (
        this.ballX >= 95 &&
        Math.abs(this.ballY - this.paddlePos) < 10
      ) {
        this.ballVX *= -1;
      }
  
      // render (omitted)
      requestAnimationFrame(this.loop);
    };
  }
  
  // main.ts
  import { LocalInputSource } from './localInputSource';
  import { RemoteInputSource } from './remoteInputSource';
  import { PongGame } from './pongGame';
  
  // determine mode: e.g. via URL param
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');
  
  let source;
  if (mode === 'remote') {
    source = new RemoteInputSource('ws://localhost:8080');
  } else {
    source = new LocalInputSource();
  }
  
  const game = new PongGame(source);
  game.init();
  