const {whatBump} = require("../.release-it.cjs");

describe("release-it version policy", () => {
    describe("breaking changes", () => {
        test.each([
            ["parser breaking field", {type: "feat", breaking: "!"}],
            ["type suffix", {type: "feat!"}],
            ["header suffix", {type: "feat", header: "feat(inject-script)!: remove legacy API"}],
            ["BREAKING CHANGE note", {type: "fix", notes: [{title: "BREAKING CHANGE", text: "new contract"}]}],
            ["BREAKING-CHANGE footer", {type: "fix", footer: "BREAKING-CHANGE: new contract"}],
        ])("treats %s as a pre-1.0 minor bump", (_label, commit) => {
            expect(whatBump([commit], "0.3.1")).toEqual({level: 1});
        });

        test("becomes a major bump after 1.0", () => {
            expect(
                whatBump([{type: "fix", notes: [{title: "BREAKING CHANGE", text: "new contract"}]}], "1.4.2")
            ).toEqual({level: 0});
        });

        test("takes precedence over lower-level changes after 1.0", () => {
            expect(whatBump([{type: "fix"}, {type: "feat"}, {type: "refactor", breaking: true}], "2.0.0")).toEqual({
                level: 0,
            });
        });
    });

    test.each(["feat", "revert"])("uses a minor bump for %s", type => {
        expect(whatBump([{type}], "0.3.1")).toEqual({level: 1});
    });

    test.each(["fix", "deps", "perf", "refactor"])("uses a patch bump for %s", type => {
        expect(whatBump([{type}], "0.3.1")).toEqual({level: 2});
    });

    test("does not release for CI and maintenance changes together", () => {
        expect(whatBump([{type: "ci"}, {type: "chore"}, {type: "docs"}], "0.5.0")).toBeNull();
    });

    test("releases a patch for dependency changes alongside CI changes", () => {
        expect(whatBump([{type: "ci"}, {type: "deps"}], "0.5.0")).toEqual({level: 2});
    });

    test("keeps breaking CI changes subject to the breaking-change policy", () => {
        expect(whatBump([{type: "ci", breaking: "!"}], "1.0.0")).toEqual({level: 0});
    });

    test("uses the highest non-breaking bump", () => {
        expect(whatBump([{type: "fix"}, {type: "feat"}], "0.3.1")).toEqual({level: 1});
    });

    test.each(["docs", "test", "chore", "build", "ci", "style"])("does not release for %s alone", type => {
        expect(whatBump([{type}], "0.3.1")).toBeNull();
    });
});
