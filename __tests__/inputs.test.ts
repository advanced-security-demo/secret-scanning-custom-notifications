import { inputs } from "../src/utils/inputs";

describe("inputs", () => {
  it("should return an object with inputs when all environment variables are set", async () => {
    process.env.LOCAL_DEV = "true";
    process.env.FREQUENCY = "30";
    process.env.SCOPE = "org";
    process.env.GITHUB_TOKEN = "test-token";
    process.env.GITHUB_API_URL = "https://test-api-url.com";
    process.env.GITHUB_REPOSITORY = "test-repo";
    process.env.GITHUB_ACTOR = "test-owner";
    process.env.GITHUB_ENTERPRISE = "test-enterprise";
    process.env.CREATE_ALERTS_FILEPATH = "test-new-alerts-filepath";
    process.env.UPDATED_ALERTS_FILEPATH = "test-closed-alerts-filepath";

    const result = await inputs();
    expect(result).toHaveProperty("scope", "org");
    expect(result).toHaveProperty("frequency", 30);
    expect(result).toHaveProperty("api_token", "test-token");
    expect(result).toHaveProperty("apiURL", "https://test-api-url.com");
    expect(result).toHaveProperty("repo", "test-repo");
    expect(result).toHaveProperty("owner", "test-owner");
    expect(result).toHaveProperty("enterprise", "test-enterprise");
    expect(result).toHaveProperty("new_alerts_filepath", "test-new-alerts-filepath");
    expect(result).toHaveProperty("closed_alerts_filepath", "test-closed-alerts-filepath");

    delete process.env.LOCAL_DEV;
    delete process.env.FREQUENCY;
    delete process.env.SCOPE;
    delete process.env.GITHUB_TOKEN;
    delete process.env.GITHUB_API_URL;
    delete process.env.GITHUB_REPOSITORY;
    delete process.env.GITHUB_ACTOR;
    delete process.env.GITHUB_ENTERPRISE;
    delete process.env.CREATE_ALERTS_FILEPATH;
    delete process.env.UPDATED_ALERTS_FILEPATH;
  });

  it("should throw an error if frequency is not a number", async () => {
    process.env.FREQUENCY = "invalid-frequency";

    await expect(inputs()).rejects.toThrowError("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");

    delete process.env.FREQUENCY;
  });

  it("should throw an error if scope is not 'repo' or 'org'", async () => {
    process.env.SCOPE = "invalid-scope";

    await expect(inputs()).rejects.toThrowError("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");

    delete process.env.SCOPE;
  });

  it("should throw an error if GITHUB_TOKEN is not set", async () => {
    delete process.env.GITHUB_TOKEN;

    await expect(inputs()).rejects.toThrowError("context.repo requires a GITHUB_REPOSITORY environment variable like 'owner/repo'");
  });
});