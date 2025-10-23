declare module "nprogress" {
    interface NProgressOptions {
        minimum?: number;
        template?: string;
        easing?: string;
        speed?: number;
        trickle?: boolean;
        trickleSpeed?: number;
        showSpinner?: boolean;
        barSelector?: string;
        parent?: string;
    }

    interface NProgress {
        configure(options: NProgressOptions): NProgress;
        start(): NProgress;
        done(force?: boolean): NProgress;
        set(n: number): NProgress;
        inc(amount?: number): NProgress;
    }

    const nprogress: NProgress;
    export default nprogress;
}
