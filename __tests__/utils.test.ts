import fs from "fs";
import { getRequiredEnvParam, calculateDateRange, writeToFile } from "../src/utils/utils";

jest.mock("fs");
jest.mock("dotenv");

describe("utils", () => {
  let processEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    processEnv = { ...process.env };
    jest.resetAllMocks();
  });

  afterEach(() => {
    process.env = processEnv;
  });

  describe("getRequiredEnvParam", () => {
    it("should return the value of an environment variable", () => {
      process.env.TEST_VAR = "test-value";
      const result = getRequiredEnvParam("TEST_VAR");
      expect(result).toEqual("test-value");
    });

    it("should throw an error if the environment variable is not set", () => {
      expect(() => getRequiredEnvParam("TEST_VAR")).toThrowError("TEST_VAR environment variable must be set");
    });
  });

  describe("calculateDateRange", () => {
    it("should return a date that is the current date minus the frequency in hours", async () => {
      const now = new Date();
      const frequency = 1;
      const expectedDate = new Date(now.getTime() - frequency * 60 * 60 * 1000);
      const result = await calculateDateRange(frequency);
      expect(result).toEqual(expectedDate);
    });
  });

  describe("writeToFile", () => {
    it("should write data to a file", () => {
      const fileName = "test-file.txt";
      const data = "test-data";
      const callback = jest.fn();
      (fs.writeFile as unknown as  jest.Mock).mockImplementationOnce((file: string, data: string | Buffer, cb: (err?: NodeJS.ErrnoException | null) => void) => cb(null));
      writeToFile(fileName, data);
      expect(fs.writeFile).toHaveBeenCalledWith(fileName, data, expect.any(Function));
    });

    it("should throw an error if there is an error writing to the file", () => {
      const fileName = "test-file.txt";
      const data = "test-data";
      const callback = jest.fn();
      const error = new Error("test-error");
      (fs.writeFile as unknown as  jest.Mock).mockImplementationOnce((file, data, cb) => cb(error));
      expect(() => writeToFile(fileName, data)).toThrowError(error);
    });
  });
});