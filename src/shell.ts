import * as tty from "tty";
import * as child_process from "child_process";

type IStream<T> = AsyncIterableIterator<T>;

function textSplit(by: string) {
    return async function* (stream: IStream<any>) {
        let text = "";
        for await (const chunk of stream) {
            text += chunk.toString();
            if (text.includes(by)) {
                const [firstPart, ...rest] = text.split(by);
                text = rest.join(by);
                yield firstPart;
            }
        }
        const items = text.split(by);
        for (let i = 0; i < items.length - 1; ++i) {
            yield items[i];
        }

        return items[items.length - 1];
    };
}

async function* ttyToStream(rs: tty.ReadStream): IStream<string> {
    for await (const chunk of rs) {
        yield chunk;
    }
}

async function* stream(source: any, reader: (stream: IStream<any>) => any) {
    if (source instanceof tty.ReadStream) {
        for await (const x of reader(ttyToStream(source))) {
            yield x;
        }
    }
    return undefined!;
}

function readFile(filePath: string) {
    return async function* () {
        const s = Bun.file(filePath).stream().getReader();
        while (1) {
            const r = await s.read();
            if (r.done) return r.value;
            yield r.value;
        }
    };
}

function $(...shell: string[]) {
    return async function* () {
        const result = child_process.execSync(shell.join(" "));
        yield result;
        return undefined;
    };
}

function textDecoder() {
    const decoder = new TextDecoder();
    return async function* (stream: IStream<any>) {
        for await (const x of stream) {
            const out = decoder.decode(x, { stream: true });
            yield out;
        }
    };
}

function repeat(times: any) {
    times = Number(times);
    return async function* (stream: IStream<any>) {
        let items = [];
        for await (const x of stream) {
            items.push(x);
            yield x;
        }
        for (let i = 1; i < times; ++i) {
            for (const x of items) {
                yield x;
            }
        }
    };
}

const commands = {
    textSplit,
    readFile,
    $,
    repeat,
    textDecoder,
};

function createCommand(cmdName: any, args: string) {
    if (!(cmdName in commands)) {
        throw new Error(`no command ${cmdName} found`);
    }

    const cmd = (commands as any)[cmdName];
    return cmd(...args.split(" "));
}

async function main() {
    if (process.stdin.isTTY) {
        for await (const line of stream(process.stdin, textSplit("\n"))) {
            const commands = line.split(" | ").map((cmdStr: string) => {
                const [cmd, ...args] = cmdStr.split(" ");
                const argsStr = args.join(" ").replaceAll("\\n", "\n");
                return createCommand(cmd, argsStr);
            });

            let prevResult = commands[0]();
            for (let i = 1; i < commands.length; ++i) {
                prevResult = commands[i](prevResult);
            }

            for await (const x of prevResult) {
                console.log("out>", x);
            }
        }
    } else {
        // pipe
        console.log("pipe");
    }
}

async function test() {
    const line = `readFile ./aaa | textDecoder | textSplit \\n | repeat 2`;

    const commands = line.split(" | ").map((cmdStr: string) => {
        const [cmd, ...args] = cmdStr.split(" ");
        const argsStr = args.join(" ").replaceAll("\\n", "\n");
        return createCommand(cmd, argsStr);
    });

    let prevResult = commands[0]();
    for (let i = 1; i < commands.length; ++i) {
        prevResult = commands[i](prevResult);
    }

    for await (const x of prevResult) {
        console.log("out>", x);
    }
}

// main();
await test();
