type DSLRuleFnResult = {
    values: any[];
    str: string;
};

type DSLRuleFn = (input: string) => DSLRuleFnResult | undefined;
type DSLRule = string | RegExp | DSLRuleFn;
type DSLRuleMatch = {
    rule: DSLRule;
    ruleDo: DSLRuleDo;
    str: string;
    values?: string[];
    fnResult?: DSLRuleFnResult;
};
type DSLRuleDo = (match: DSLRuleMatch) => any;

type DSLMap = Map<DSLRule, DSLRuleDo>;
type DSLMapArr = [DSLRule, DSLRuleDo][];

type DSLSolverConfig = {
    // by default solve by longest length
    // -N or 0 means match1, +N means match2
    custom?: (match1: DSLRuleMatch, match2: DSLRuleMatch) => number;
};

const noop = () => {};

function _dslSyncMatch(
    input: string,
    dsl: DSLMap | DSLMapArr,
    solver: DSLSolverConfig
) {
    let matched: DSLRuleMatch[] = [];
    for (const [rule, ruleDo] of dsl) {
        if (typeof rule === "string") {
            if (input.startsWith(rule)) {
                matched.push({
                    rule,
                    ruleDo,
                    str: rule,
                    values: [rule],
                });
            }
        }
        if (rule instanceof RegExp) {
            const r = input.match(rule);
            if (r) {
                matched.push({
                    rule,
                    ruleDo,
                    str: r[0],
                });
            }
        }
        if (typeof rule === "function") {
            const r = rule(input);
            if (r) {
                matched.push({
                    rule,
                    ruleDo,
                    str: r.str,
                    fnResult: r,
                });
            }
        }
    }

    if (matched.length === 0) {
        return undefined;
    }

    matched.sort((a, b) => {
        if (!solver.custom) {
            return b.str.length - a.str.length;
        }
        return solver.custom(a, b);
    });

    return matched[0];
}

async function dslRunAsync(
    input: string,
    dsl: DSLMap | DSLMapArr,
    solver: DSLSolverConfig = {}
): Promise<string | undefined> {
    while (input.length !== 0) {
        const matched = _dslSyncMatch(input, dsl, solver);
        if (!matched) return input;

        await matched.ruleDo(matched);
        input = input.substring(matched.str.length);
    }

    return undefined;
}

function dslRun(
    input: string,
    dsl: DSLMap | DSLMapArr,
    solver: DSLSolverConfig = {}
): string | undefined {
    while (input.length !== 0) {
        const matched = _dslSyncMatch(input, dsl, solver);
        if (!matched) return input;

        matched.ruleDo(matched);
        input = input.substring(matched.str.length);
    }

    return undefined;
}

async function example2() {
    let topArr: any;
    const arrStack: any[] = [];

    const dsl: DSLMapArr = [
        [
            "[",
            () => {
                arrStack.push([]);
                if (arrStack[arrStack.length - 2]) {
                    arrStack[arrStack.length - 2].push(
                        arrStack[arrStack.length - 1]
                    );
                }
                if (!topArr) {
                    topArr = arrStack[arrStack.length - 1];
                }
            },
        ],
        ["]", () => arrStack.pop()],
        [
            /^\d+/,
            ({ str }) => {
                arrStack[arrStack.length - 1].push(+str);
            },
        ],
        [/\s+/, noop],
        [",", noop],
    ];

    dslRun("[ 1, 2, 3, 4 ]", dsl);

    console.log(topArr);
}

example2();
