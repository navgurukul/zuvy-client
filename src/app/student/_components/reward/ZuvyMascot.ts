/**
 * ZUVY Mascot Component
 * ----------------------------------------------------------------------
 * Dependency-free, reusable mascot widget.
 */

type ExpressionKey = 'idle' | 'thinking' | 'happy' | 'celebrate' | 'surprise' | 'talk' | 'sad';

const EXPRESSIONS: Record<ExpressionKey, string | string[]> = {
  idle: "idle.png",
  thinking: "thinking.png",
  happy: "talk-b.png",
  celebrate: "celebrate.png",
  surprise: "surprise.png",
  talk: ["talk-c.png", "talk-a.png", "talk-b.png"], // closed -> open -> open-wide
  sad: "sad.png",
};

const DEFAULT_MESSAGES = [
  "Awesome work!",
  "Great job!",
  "Keep it up!",
  "You're getting stronger!",
  "You're climbing fast!",
  "Fantastic!",
  "Nice progress!",
  "One more chapter!",
  "Top 10 is getting closer!",
];

export interface ZuvyMascotOptions {
  assetPath?: string;
  container?: HTMLElement;
  autoIdle?: boolean;
}

export class ZuvyMascot {
  assetPath: string;
  container: HTMLElement;
  autoIdle: boolean;

  private _state: string = 'idle';
  private _talkTimer: any = null;
  private _talkTimeout: any = null;
  private _blinkTimer: any = null;
  private _mounted: boolean = false;
  private _visible: boolean = false;

  el!: HTMLDivElement;
  bubbleEl!: HTMLDivElement;
  bodyEl!: HTMLDivElement;
  spriteA!: HTMLImageElement;
  spriteB!: HTMLImageElement;
  blinkEl!: HTMLDivElement;

  constructor(opts: ZuvyMascotOptions = {}) {
    this.assetPath = (opts.assetPath || "/assets/mascot").replace(/\/$/, "");
    this.container = opts.container || (typeof document !== 'undefined' ? document.body : (null as any));
    this.autoIdle = opts.autoIdle !== false;

    if (typeof document !== 'undefined') {
      this._buildDom();
      this._preload();
    }
  }

  private _buildDom() {
    const root = document.createElement("div");
    root.className = "zuvy-mascot";
    root.setAttribute("aria-hidden", "true");

    const bubble = document.createElement("div");
    bubble.className = "zm-bubble";
    bubble.setAttribute("role", "status");

    const bodyWrap = document.createElement("div");
    bodyWrap.className = "zm-body-wrap";

    const body = document.createElement("div");
    body.className = "zm-body";

    const imgA = document.createElement("img");
    imgA.className = "zm-sprite zm-sprite-current";
    imgA.alt = "Zuvy mascot";
    imgA.draggable = false;

    const imgB = document.createElement("img");
    imgB.className = "zm-sprite zm-sprite-fade";
    imgB.alt = "";
    imgB.draggable = false;
    imgB.setAttribute("aria-hidden", "true");

    const blink = document.createElement("div");
    blink.className = "zm-blink";

    body.appendChild(imgA);
    body.appendChild(imgB);
    body.appendChild(blink);
    bodyWrap.appendChild(body);

    root.appendChild(bubble);
    root.appendChild(bodyWrap);

    this.el = root;
    this.bubbleEl = bubble;
    this.bodyEl = body;
    this.spriteA = imgA;
    this.spriteB = imgB;
    this.blinkEl = blink;

    this._setSprite("idle");
  }

  private _preload() {
    if (typeof window === 'undefined') return;
    const seen = new Set<string>();
    const collectAll = (val: string | string[]) => (Array.isArray(val) ? val : [val]);
    Object.values(EXPRESSIONS).forEach((v) => {
      collectAll(v).forEach((file) => {
        if (seen.has(file)) return;
        seen.add(file);
        const img = new Image();
        img.src = `${this.assetPath}/${file}`;
      });
    });
  }

  private _frameUrl(file: string) {
    return `${this.assetPath}/${file}`;
  }

  /** Cross-fades the visible sprite to a new expression frame. */
  private _setSprite(expressionOrFile: string) {
    const expr = EXPRESSIONS[expressionOrFile as ExpressionKey];
    const file = expr
      ? (Array.isArray(expr) ? expr[0] : expr)
      : expressionOrFile;

    const url = this._frameUrl(file);
    if (this.spriteA.src && this.spriteA.src.endsWith(file)) return;

    this.spriteB.src = url;
    this.spriteB.classList.remove("zm-sprite-fade");
    this.spriteB.classList.add("zm-sprite-current");
    this.spriteA.classList.remove("zm-sprite-current");
    this.spriteA.classList.add("zm-sprite-fade");

    // swap references
    const tmp = this.spriteA;
    this.spriteA = this.spriteB;
    this.spriteB = tmp;
  }

  private _scheduleBlink() {
    clearTimeout(this._blinkTimer);
    const next = 4000 + Math.random() * 3000;
    this._blinkTimer = setTimeout(() => {
      if (this._state === "idle" && this._visible) {
        this.blinkEl.classList.remove("zm-blinking");
        void this.blinkEl.offsetWidth; // reflow
        this.blinkEl.classList.add("zm-blinking");
      }
      this._scheduleBlink();
    }, next);
  }

  private _startAutoIdle() {
    if (!this.autoIdle) return;
    this.bodyEl.classList.add("zm-tilt");
    this._scheduleBlink();
  }

  private _stopAutoIdle() {
    clearTimeout(this._blinkTimer);
  }

  mount(container?: HTMLElement) {
    if (this._mounted) return this;
    const target = container || this.container;
    if (target && this.el) {
      target.appendChild(this.el);
      this._mounted = true;
    }
    return this;
  }

  destroy() {
    this._stopAutoIdle();
    clearInterval(this._talkTimer);
    clearTimeout(this._talkTimeout);
    if (this.el && this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
    this._mounted = false;
  }

  show() {
    if (!this._mounted) this.mount();
    this._visible = true;
    this.el.classList.add("zm-entering");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        this.el.classList.remove("zm-leaving");
        this.el.classList.add("zm-visible");
      });
    });
    this.idle();
    this._startAutoIdle();
    return this;
  }

  hide() {
    this._visible = false;
    this._stopAutoIdle();
    this.el.classList.add("zm-leaving");
    this.el.classList.remove("zm-visible");
    this.closeBubble();
    return this;
  }

  idle() {
    this._state = "idle";
    clearInterval(this._talkTimer);
    clearTimeout(this._talkTimeout);
    this.bodyEl.classList.remove("zm-celebrate", "zm-surprised");
    this._setSprite("idle");
    return this;
  }

  talk(message?: string, opts: { duration?: number } = {}) {
    const text = message || DEFAULT_MESSAGES[Math.floor(Math.random() * DEFAULT_MESSAGES.length)];
    this._state = "talking";
    clearInterval(this._talkTimer);
    clearTimeout(this._talkTimeout);

    this.openBubble(text);

    const frames = EXPRESSIONS.talk as string[];
    let i = 0;
    this._setSprite(frames[0]);
    this._talkTimer = setInterval(() => {
      i = (i + 1) % frames.length;
      this._setSprite(frames[i]);
    }, 120);

    const duration = opts.duration || Math.max(1600, Math.min(5000, text.length * 70));
    this._talkTimeout = setTimeout(() => this.stopTalking(), duration);
    return this;
  }

  stopTalking() {
    clearInterval(this._talkTimer);
    clearTimeout(this._talkTimeout);
    this.closeBubble();
    if (this._state === "talking") this.idle();
    return this;
  }

  celebrate() {
    this._state = "celebrate";
    this._setSprite("celebrate");
    this.bodyEl.classList.remove("zm-celebrate");
    void this.bodyEl.offsetWidth;
    this.bodyEl.classList.add("zm-celebrate");
    clearTimeout(this._talkTimeout);
    this._talkTimeout = setTimeout(() => {
      this.bodyEl.classList.remove("zm-celebrate");
      this.idle();
    }, 750);
    return this;
  }

  think() {
    this._state = "thinking";
    this._setSprite("thinking");
    clearTimeout(this._talkTimeout);
    this._talkTimeout = setTimeout(() => {
      if (this._state === "thinking") this.idle();
    }, 1400);
    return this;
  }

  surprised() {
    this._state = "surprise";
    this._setSprite("surprise");
    this.bodyEl.classList.remove("zm-surprised");
    void this.bodyEl.offsetWidth;
    this.bodyEl.classList.add("zm-surprised");
    clearTimeout(this._talkTimeout);
    this._talkTimeout = setTimeout(() => {
      this.bodyEl.classList.remove("zm-surprised");
      if (this._state === "surprise") this.idle();
    }, 900);
    return this;
  }

  sad() {
    this._state = "sad";
    this._setSprite("sad");
    this.bodyEl.classList.remove("zm-celebrate", "zm-surprised", "zm-sad");
    void this.bodyEl.offsetWidth;
    this.bodyEl.classList.add("zm-sad");
    clearTimeout(this._talkTimeout);
    this._talkTimeout = setTimeout(() => {
      this.bodyEl.classList.remove("zm-sad");
    }, 1000);
    return this;
  }

  openBubble(text: string) {
    this.bubbleEl.textContent = text;
    this.bubbleEl.classList.add("zm-shown");
    return this;
  }

  closeBubble() {
    this.bubbleEl.classList.remove("zm-shown");
    return this;
  }
}
