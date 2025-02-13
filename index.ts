import {ResolveOptions} from "webpack";

type Resolver = NonNullable<ResolveOptions["resolver"]>;

const pluginName = "ResolveTypescriptPlugin";

export interface ResolveTypescriptPluginOptions {
    includeNodeModules?: boolean;
}

export default class ResolveTypescriptPlugin {
    private static defaultOptions: ResolveTypescriptPluginOptions = {
        includeNodeModules: false
    };

    private options: ResolveTypescriptPluginOptions;

    public constructor(options: ResolveTypescriptPluginOptions = {}) {
        this.options = {...ResolveTypescriptPlugin.defaultOptions, ...options};
    }

    public apply(resolver: Resolver): void {
        const target = resolver.ensureHook("file");
        for (const extension of [".ts", ".tsx"]) {
            resolver
                .getHook("raw-file")
                .tapAsync(pluginName, (request, resolveContext, callback) => {
                    if (
                        !request.path ||
                        (!this.options.includeNodeModules &&
                            request.path.match(/(^|[\\/])node_modules($|[\\/])/))
                    ) {
                        return callback();
                    }

                    const path = request.path.replace(/\.js$/, extension);
                    if (path === request.path) {
                        callback();
                    } else {
                        resolver.doResolve(
                            target,
                            {
                                ...request,
                                path,
                                relativePath:
                                    request.relativePath &&
                                    request.relativePath.replace(/\.js$/, extension)
                            },
                            `using path: ${path}`,
                            resolveContext,
                            callback
                        );
                    }
                });
        }
    }
}
