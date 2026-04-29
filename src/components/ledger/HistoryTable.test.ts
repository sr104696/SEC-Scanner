import { csvEscape } from "./HistoryTable";

describe("csvEscape (RFC 4180)", () => {
  test("plain text passes through", () => {
    expect(csvEscape("Revenue")).toBe("Revenue");
  });

  test("null/undefined become empty string", () => {
    expect(csvEscape(null)).toBe("");
    expect(csvEscape(undefined)).toBe("");
  });

  test("commas force quoting", () => {
    expect(csvEscape("Apple, Inc.")).toBe('"Apple, Inc."');
  });

  test("embedded quotes are doubled", () => {
    expect(csvEscape('She said "hi"')).toBe('"She said ""hi"""');
  });

  test("newlines force quoting", () => {
    expect(csvEscape("a\nb")).toBe('"a\nb"');
    expect(csvEscape("a\r\nb")).toBe('"a\r\nb"');
  });

  test("numbers stringify without quoting", () => {
    expect(csvEscape(12345.67)).toBe("12345.67");
  });
});
