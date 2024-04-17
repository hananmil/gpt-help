import axios from "axios";
import * as vscode from "vscode";
import { ExtensionContext } from "vscode";
import * as openBrowser from "open";
import { UserInfo, WithJwt } from "./auth";

class AssisieService {
  constructor() {}

  public async verifyLogin(context: ExtensionContext): Promise<UserInfo & WithJwt> {
    context.secrets.delete("ASSISIE_JWT");
    const jsonStr = await context.secrets.get("ASSISIE_JWT");
    let credentials: (UserInfo & WithJwt) | undefined = jsonStr ? JSON.parse(jsonStr) : undefined;
    if (credentials) {
      const result = await axios.get(`http://localhost:3000/auth/verify`, {
        headers: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          Authorization: `Bearer ${credentials.jwt}`,
        },
      });
      vscode.window.showInformationMessage(`Logged in as ${result.data.email}`);
      return credentials;
    }
    const result = await axios.get(`http://localhost:3000/auth/login/cli`);
    const data = result.data;
    vscode.env.openExternal(data.url);

    while (!credentials) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      try {
        const userInfoResposne = await axios.get<UserInfo & WithJwt>(
          `http://localhost:3000/auth/jwt?state=${data.state}`
        );
        credentials = userInfoResposne.data;
        await context.secrets.store("ASSISIE_JWT", JSON.stringify(credentials));
      } catch (error: any) {
        console.log("Waiting for login failed, ", error.message);
      }
    }
    return credentials;
  }
}

export default new AssisieService();
