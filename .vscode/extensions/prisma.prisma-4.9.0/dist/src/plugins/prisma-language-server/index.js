"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const watcher_1 = __importDefault(require("watcher"));
const minimatch_1 = __importDefault(require("minimatch"));
const vscode_1 = require("vscode");
const vscode_languageclient_1 = require("vscode-languageclient");
const node_1 = require("vscode-languageclient/node");
const telemetryReporter_1 = __importDefault(require("../../telemetryReporter"));
const util_1 = require("../../util");
const packageJson = require('../../../../package.json'); // eslint-disable-line
let client;
let serverModule;
let telemetry;
let watcherInstance;
const isDebugMode = () => process.env.VSCODE_DEBUG_MODE === 'true';
const isE2ETestOnPullRequest = () => process.env.PRISMA_USE_LOCAL_LS === 'true';
const activateClient = (context, serverOptions, clientOptions) => {
    // Create the language client
    client = (0, util_1.createLanguageServer)(serverOptions, clientOptions);
    const disposable = client.start();
    // Start the client. This will also launch the server
    context.subscriptions.push(disposable);
};
const startFileWatcher = (rootPath) => {
    console.debug('Starting File Watcher');
    // https://github.com/fabiospampinato/watcher
    return new watcher_1.default(rootPath, {
        debounce: 500,
        // limits how many levels of subdirectories will be traversed.
        // Note that `node_modules/.prisma/client/` counts for 3 already
        // Example
        // If vs code extension is open in root folder of a project and the path to index.d.ts is
        // ./server/database/node_modules/.prisma/client/index.d.ts
        // then the depth is equal to 2 + 3 = 5
        depth: 9,
        recursive: true,
        ignoreInitial: true,
        ignore: (targetPath) => {
            if (targetPath === rootPath) {
                return false;
            }
            return !(0, minimatch_1.default)(targetPath, '**/node_modules/.prisma/client/index.d.ts');
        },
        //   // ignore dotfiles (except .prisma) adjusted from chokidar README example
        //   ignored: /(^|[\/\\])\.(?!prisma)./,
        // native?: boolean,
        // persistent?: boolean,
        // pollingInterval?: number,
        // pollingTimeout?: number,
        // renameDetection?: boolean,
        // renameTimeout?: number
    });
};
const onFileChange = (filepath) => {
    console.debug(`File ${filepath} has been changed. Restarting TS Server.`);
    vscode_1.commands.executeCommand('typescript.restartTsServer'); // eslint-disable-line
};
const plugin = {
    name: 'prisma-language-server',
    enabled: () => true,
    activate: (context) => __awaiter(void 0, void 0, void 0, function* () {
        var _a;
        const isDebugOrTest = (0, util_1.isDebugOrTestSession)();
        const rootPath = (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a[0].uri.path;
        if (rootPath) {
            // This setting defaults to true (see package.json of vscode extension)
            const isFileWatcherEnabled = vscode_1.workspace.getConfiguration('prisma').get('fileWatcher');
            if (isFileWatcherEnabled) {
                watcherInstance = startFileWatcher(rootPath);
                console.debug('File Watcher is enabled and started.');
            }
            else {
                console.debug('File Watcher is disabled.');
            }
        }
        else {
            console.debug('File Watcher was skipped, rootPath is falsy');
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (packageJson.name === 'prisma-insider-pr-build') {
            console.log('Using local Language Server for prisma-insider-pr-build');
            serverModule = context.asAbsolutePath(path_1.default.join('./language-server/dist/src/bin'));
        }
        else if (isDebugMode() || isE2ETestOnPullRequest()) {
            // use Language Server from folder for debugging
            console.log('Using local Language Server from filesystem');
            serverModule = context.asAbsolutePath(path_1.default.join('../../packages/language-server/dist/src/bin'));
        }
        else {
            console.log('Using published Language Server (npm)');
            // use published npm package for production
            serverModule = require.resolve('@prisma/language-server/dist/src/bin');
        }
        console.log(`serverModule: ${serverModule}`);
        // The debug options for the server
        // --inspect=6009: runs the server in Node's Inspector mode so VSCode can attach to the server for debugging
        const debugOptions = {
            execArgv: ['--nolazy', '--inspect=6009'],
            env: { DEBUG: true },
        };
        // If the extension is launched in debug mode then the debug server options are used
        // Otherwise the run options are used
        const serverOptions = {
            run: { module: serverModule, transport: node_1.TransportKind.ipc },
            debug: {
                module: serverModule,
                transport: node_1.TransportKind.ipc,
                options: debugOptions,
            },
        };
        // Options to control the language client
        const clientOptions = {
            // Register the server for prisma documents
            documentSelector: [{ scheme: 'file', language: 'prisma' }],
            /* This middleware is part of the workaround for https://github.com/prisma/language-tools/issues/311 */
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            middleware: {
                provideCodeActions(document, range, context, token, _) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const params = {
                            textDocument: client.code2ProtocolConverter.asTextDocumentIdentifier(document),
                            range: client.code2ProtocolConverter.asRange(range),
                            context: client.code2ProtocolConverter.asCodeActionContext(context),
                        };
                        return client.sendRequest(vscode_languageclient_1.CodeActionRequest.type, params, token).then((values) => {
                            if (values === null)
                                return undefined;
                            const result = [];
                            for (const item of values) {
                                if (vscode_languageclient_1.CodeAction.is(item)) {
                                    const action = client.protocol2CodeConverter.asCodeAction(item);
                                    if ((0, util_1.isSnippetEdit)(item, client.code2ProtocolConverter.asTextDocumentIdentifier(document)) &&
                                        item.edit !== undefined) {
                                        action.command = {
                                            command: 'prisma.applySnippetWorkspaceEdit',
                                            title: '',
                                            arguments: [action.edit],
                                        };
                                        action.edit = undefined;
                                    }
                                    result.push(action);
                                }
                                else {
                                    const command = client.protocol2CodeConverter.asCommand(item);
                                    result.push(command);
                                }
                            }
                            return result;
                        }, (_) => undefined);
                    });
                },
            }, // eslint-disable-line @typescript-eslint/no-explicit-any
        };
        // const config = workspace.getConfiguration('prisma')
        vscode_1.workspace.onDidChangeConfiguration((event) => __awaiter(void 0, void 0, void 0, function* () {
            var _b;
            const fileWatcherConfigChanged = event.affectsConfiguration('prisma.fileWatcher');
            if (fileWatcherConfigChanged) {
                const isFileWatcherEnabled = vscode_1.workspace.getConfiguration('prisma').get('fileWatcher');
                const rootPath = (_b = vscode_1.workspace.workspaceFolders) === null || _b === void 0 ? void 0 : _b[0].uri.path;
                // This setting defaults to true (see package.json of vscode extension)
                if (isFileWatcherEnabled) {
                    // if watcherInstance.closed === true, the watcherInstance was closed previously and can be safely restarted
                    // if watcherInstance.closed === false, it is already running
                    // but if the JSON settings are empty like {} and the user enables the file watcherInstance
                    // we need to catch that case to avoid starting another extra file watcherInstance
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
                    if (watcherInstance && watcherInstance.isClosed() === false) {
                        console.debug("onDidChangeConfiguration: watcherInstance.isClosed() === false so it's already running. Do nothing.");
                    }
                    else {
                        // Let's start it
                        if (rootPath) {
                            watcherInstance = startFileWatcher(rootPath);
                            // If the file was just created
                            watcherInstance.on('add', onFileChange);
                            // If the file was modified
                            watcherInstance.on('change', onFileChange);
                            console.debug('onDidChangeConfiguration: File Watcher is now enabled and started.');
                        }
                        else {
                            console.debug('onDidChangeConfiguration: rootPath is falsy');
                        }
                    }
                }
                else {
                    // Let's stop it
                    if (watcherInstance) {
                        yield watcherInstance.close();
                        console.debug('onDidChangeConfiguration: File Watcher stopped.');
                    }
                    else {
                        console.debug('onDidChangeConfiguration: No File Watcher found');
                    }
                }
            }
        }), // eslint-disable-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
        null, context.subscriptions);
        context.subscriptions.push(vscode_1.commands.registerCommand('prisma.restartLanguageServer', () => __awaiter(void 0, void 0, void 0, function* () {
            client = yield (0, util_1.restartClient)(context, client, serverOptions, clientOptions);
            vscode_1.window.showInformationMessage('Prisma language server restarted.'); // eslint-disable-line @typescript-eslint/no-floating-promises
        })), 
        /* This command is part of the workaround for https://github.com/prisma/language-tools/issues/311 */
        vscode_1.commands.registerCommand('prisma.applySnippetWorkspaceEdit', (0, util_1.applySnippetWorkspaceEdit)()), vscode_1.commands.registerCommand('prisma.filewatcherEnable', () => __awaiter(void 0, void 0, void 0, function* () {
            const prismaConfig = vscode_1.workspace.getConfiguration('prisma');
            // First, is set to true value
            // Second, is set it on Workspace level settings
            yield prismaConfig.update('fileWatcher', true, false);
        })), vscode_1.commands.registerCommand('prisma.filewatcherDisable', () => __awaiter(void 0, void 0, void 0, function* () {
            const prismaConfig = vscode_1.workspace.getConfiguration('prisma');
            // First, is set to false value
            // Second, is set it on Workspace level settings
            yield prismaConfig.update('fileWatcher', false, false);
        })));
        activateClient(context, serverOptions, clientOptions);
        if (!isDebugOrTest) {
            // eslint-disable-next-line
            const extensionId = 'prisma.' + packageJson.name;
            // eslint-disable-next-line
            const extensionVersion = packageJson.version;
            telemetry = new telemetryReporter_1.default(extensionId, extensionVersion);
            context.subscriptions.push(telemetry);
            yield telemetry.sendTelemetryEvent();
            if (extensionId === 'prisma.prisma-insider') {
                (0, util_1.checkForOtherPrismaExtension)();
            }
        }
        (0, util_1.checkForMinimalColorTheme)();
        if (watcherInstance) {
            watcherInstance.on('add', onFileChange);
            watcherInstance.on('change', onFileChange);
        }
    }),
    deactivate: () => __awaiter(void 0, void 0, void 0, function* () {
        if (!client) {
            return undefined;
        }
        if (!(0, util_1.isDebugOrTestSession)()) {
            telemetry.dispose(); // eslint-disable-line @typescript-eslint/no-floating-promises
        }
        return client.stop();
    }),
};
exports.default = plugin;
//# sourceMappingURL=index.js.map