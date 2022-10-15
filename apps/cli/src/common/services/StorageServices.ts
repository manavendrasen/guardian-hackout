import { webcrypto } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { createFile, readFile } from "../../services/initService";
import { createProject } from "../api/project";
import { CryptoFunctions } from "../cryptoFunctions";
import { Utils } from "../utils";
import { AuthTokens } from "./AuthServices";
import { CryptoServices } from "./CryptoServices";

export type CreateProjectMeta = {
  name: string;
  description: string;
  webhook: string;
};

export type Project = {
  projectId: string;
  encryptedProjectKey: string;
  encryptedName: string;
  encryptedDescription: string;
  encryptedWebhook: string;
};

export type CreateConfigMeta = {
  name: string;
  description: string;
};

export class StorageService {
  private cs: CryptoServices;
  private cf: CryptoFunctions;
  private tokens: AuthTokens;

  constructor(tokens: AuthTokens) {
    this.cs = new CryptoServices(webcrypto);
    this.cf = new CryptoFunctions(webcrypto);
    this.tokens = tokens;
  }

  async createNewProject(projectMeta: CreateProjectMeta): Promise<Project> {
    const projectKeyStr = await this.cs.getProjectKey();

    const encryptedProjectKey = await this.cs.getEncryptedProjectKey(
      projectKeyStr,
      this.tokens.publicKey
    );

    const projectKeyBuf = Utils.fromB64ToBuffer(projectKeyStr);
    const nameBuf = Utils.fromStringToBuffer(projectMeta.name);
    const descriptionBuf = Utils.fromStringToBuffer(projectMeta.description);
    const webhookBuf = Utils.fromStringToBuffer(projectMeta.webhook);

    const encNameBuf = await this.cf.encrypt(nameBuf, projectKeyBuf, "AES-GCP");
    const encDescriptionBuf = await this.cf.encrypt(
      descriptionBuf,
      projectKeyBuf,
      "AES-GCP"
    );
    const encWebhookBuf = await this.cf.encrypt(
      webhookBuf,
      projectKeyBuf,
      "AES-GCP"
    );

    const encNameStr = Utils.fromBufferToB64(encNameBuf);
    const encDescriptionStr = Utils.fromBufferToB64(encDescriptionBuf);
    const encWebhookStr = Utils.fromBufferToB64(encWebhookBuf);

    const project = await createProject(
      encryptedProjectKey,
      encNameStr,
      encDescriptionStr,
      encWebhookStr,
      this.tokens.accessToken
    );

    return {
      projectId: project.id,
      encryptedProjectKey,
      encryptedName: project.name,
      encryptedDescription: project.description,
      encryptedWebhook: project.webhookUrl
    };
  }

  async getProject(projectId: string) {
    const project = readFile("project.txt");
    console.log(project);
  }
}