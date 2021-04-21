import * as seedrandom from 'seedrandom';
import { BaseRenderer } from './baseRenderer';
import gsap from 'gsap';
import P5 from 'p5';

const srandom = seedrandom('b');

let particles = [];

let image,
    r,
    g,
    b;

export default class P5Renderer implements BaseRenderer{

    colors = ['#4EEC6C', '#FFEB34', '#00A7FF', '#FF6100', '#FF0053'];
    backgroundColor = '#FFFFFF';

    canvas: HTMLCanvasElement;
    s: any;


    completeCallback: any;
    delta = 0;
    animating = true;

    width: number = 1920 / 2;
    height: number = 1080 / 2;

    constructor(w, h) {

        this.width = w;
        this.height = h;

        const sketch = (s) => {
            this.s = s;
            s.pixelDensity(1);
            s.setup = () => this.setup(s)
            s.draw = () => this.draw(s)
        }

        new P5(sketch);

    }

    protected setup(s) {
        let renderer = s.createCanvas(this.width, this.height);
        this.canvas = renderer.canvas;

        image = s.createGraphics(this.width, this.height);
        r = s.createGraphics(this.width, this.height);
        g = s.createGraphics(this.width, this.height);
        b = s.createGraphics(this.width, this.height);

        s.background(0, 0, 0, 255);

        for (let i = 0; i < 100; i++) {
            particles.push({
                x: s.width / 2, 
                y: s.height / 2, 
                vx: -2 + srandom() * 4,
                vy: -2 + srandom() * 4,
                r: 3 + srandom() * 10
            });
        }
    }

    protected draw(s) {

        if (this.animating) {     
            this.delta += 0.01;
            s.blendMode(s.BLEND);
            s.background(0, 0, 0, 255);
            image.background(0, 0, 0, 255);

            for (let i = 0; i < particles.length; i++) {
                let particle = particles[i];
                if (particle.x < 0 || particle.x > s.width || particle.y < 0 || particle.y > s.height) {
                    particle.x = s.width / 2;
                    particle.y = s.height / 2;
                }
                particle.x += particle.vx;
                particle.y += particle.vy;
                image.noStroke();
                image.fill(255, 255, 255, 255);
                image.circle(particle.x, particle.y, particle.r);
            }
            
            this.glitch(s);
            this.drawChannels(s);

            //s.image(image, 0, 0, s.width, s.height);
        }
    }

    protected glitch(s) {

        let segments = [];
        for (let i = 0; i < 5; i++) {
            let size = 100 + srandom() * ((s.height / 5) - 100);
            //let size = 50;
            if (segments.reduce((a, b) => a + b, 0) < s.height) {
                segments.push(size);
            }
        }
        segments.push(s.height);

        let rects = [];
        let top = 0;
        for (let j = 0; j < segments.length; j++) {
            let rect = image.get(0, top, s.width, segments[j])
            rects.push(rect);
            top += segments[j];
        }

        image.background(0, 0, 0, 255);
        let top2 = 0;
        for (let l = 0; l < rects.length; l++) {
            let x = - 40 + s.cos(s.noise(this.delta + l)) * 50;
            image.image(rects[l], x, top2, s.width, segments[l]);
            top2 += segments[l];
        }

    }

    protected drawChannels(s) {
        image.loadPixels();
        r.loadPixels();
        g.loadPixels();
        b.loadPixels();

        let size = 4 * s.width * s.height;
        
        for (let i = 0; i < size; i+=4) {
            r.pixels[i] = image.pixels[i];

            g.pixels[i + 1] = image.pixels[i + 1]; //image.pixels[i + 1];
            b.pixels[i + 2] = image.pixels[i + 1];

            r.pixels[i + 3] = image.pixels[i + 3];
            g.pixels[i + 3] = image.pixels[i + 3];
            b.pixels[i + 3] = image.pixels[i + 3];
        }

        r.updatePixels();
        g.updatePixels();
        b.updatePixels();

        s.blendMode(s.ADD);

        s.image(r, 0, 0, s.width, s.height);

        let x = - 40 + s.cos(s.noise(this.delta)) * 50;
        s.translate(x, 0);
        s.image(g, 0, 0, s.width, s.height);

        let y = s.cos(s.noise(this.delta)) * 5;
        s.translate(0, y);
        //s.translate(0, s.cos(this.delta) * 5);
        s.image(b, 0, 0, s.width, s.height);
    }

    public render() {

    }

    public play() {
        this.animating = true;
        setTimeout(() => {
            console.log('go');
            if (this.completeCallback) {
                this.completeCallback();
            }
        }, 10000);
    }

    public stop() {
        this.animating = false;
    }

    public setCompleteCallback(completeCallback: any) {
        this.completeCallback = completeCallback;
    }

    public resize() {
        this.s.resizeCanvas(window.innerWidth, window.innerHeight);
        this.s.background(0, 0, 0, 255);
    }
}