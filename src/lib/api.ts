import axios from "axios";

export const API_BASE_URL =
  "https://script.google.com/macros/s/AKfycbyjFiCgkm8RuQ40zZvVXA5XvO9rrNHlMnX3CyzWI9R8ESGbXkEJd181C2lmWAnoMNbVcw/exec";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "text/plain;charset=utf-8",
  },
  timeout: 30000,
});

async function request(payload: Record<string, any>) {
  try {
    const response = await apiClient.post(
      "",
      JSON.stringify(payload)
    );

    if (typeof response.data === "string") {
      try {
        return JSON.parse(response.data);
      } catch {
        console.error(
          "API returned non-JSON response:",
          response.data
        );

        return {
          success: false,
          message: "Server returned an invalid response.",
        };
      }
    }

    return response.data;
  } catch (err: any) {
    console.error("API Error:", err);

    const status = err?.response?.status;
    const responseData = err?.response?.data;

    if (err?.code === "ECONNABORTED" || err?.code === "ETIMEDOUT") {
      return {
        success: false,
        message: "Request timed out. Please try again."
      };
    }

    // console.error("API Status:", status);
    // console.error("API Response:", responseData);

    return {
      success: false,
      message:
        status === 404
          ? "API endpoint not found. Please check the Google Apps Script deployment URL."
          : responseData?.message ||
            err?.message ||
            "Server Error",
    };
  }
}

export const api = {

  signup(
    name: string,
    email: string,
    password: string
  ) {

    return request({
      action: "signup",
      name,
      email,
      password
    });

  },



  login(
    email: string,
    password: string
  ) {

    return request({
      action: "login",
      email,
      password
    });

  },

  googleLogin(idToken: string) {

  return request({

    action: "googleLogin",

    idToken,

  });

},

sendOTP(email: string) {

  return request({

    action: "sendOTP",

    email,

  });

},

verifyOTP(email: string, otp: string) {

  return request({

    action: "verifyOTP",

    email,

    otp,

  });

},

completeOnboarding(
  token: string,
  name: string,
  language: string,
  occupation: string,
  useCase: string
) {

  return request({
    action: "completeOnboarding",
    token,
    name,
    language,
    occupation,
    useCase,
  });

},

updateLanguage(
  token: string,
  language: string
) {

  return request({
    action: "updateLanguage",
    token,
    language,
  });

},

updateProfileName(
  token: string,
  name: string
) {

  return request({
    action: "updateProfileName",
    token,
    name,
  });

},

uploadAvatar(
  token: string,
  image: string,
  fileName: string,
  mimeType: string
) {
  return request({
    action: "uploadAvatar",
    token,
    image,
    fileName,
    mimeType,
  });
},



  logout(token: string) {

    return request({
      action: "logout",
      token
    });

  },

  deleteAccount(token: string) {

  return request({
    action: "deleteAccount",
    token
  });

},

    createNote(
    token: string,
    title = "",
    content = "",
    groupId: string | null = null,
    noteId?: string
  ) {
    return request({
      action: "createNote",
      token,
      title,
      content,
      groupId,
      ...(noteId ? { noteId } : {}),
    });
  },

  getNotes(token: string) {
    return request({
      action: "getNotes",
      token,
    });
  },

  updateNote(
    token: string,
    noteId: string,
    title: string,
    content: string,
    groupId: string | null = null
  ) {
    return request({
      action: "updateNote",
      token,
      noteId,
      title,
      content,
      groupId,
    });
  },

  deleteNote(token: string, noteId: string) {
    return request({
      action: "deleteNote",
      token,
      noteId,
    });
  },

  bulkArchiveNotes(token: string, noteIds: string[], archived: boolean) {
    return request({
      action: "bulkArchiveNotes",
      token,
      noteIds,
      archived,
    });
  },

  bulkTrashNotes(token: string, noteIds: string[]) {
    return request({
      action: "bulkTrashNotes",
      token,
      noteIds,
    });
  },

  bulkMoveNotesToGroup(token: string, noteIds: string[], groupId: string) {
    return request({
      action: "bulkMoveNotesToGroup",
      token,
      noteIds,
      groupId,
    });
  },
  

    createShare(
    token: string,
    noteId: string
  ) {
    return request({
      action: "createShare",
      token,
      noteId,
    });
  },


  moveNoteToGroup(
    token: string,
    noteId: string,
    groupId: string
  ) {
    return request({
      action: "moveNoteToGroup",
      token,
      noteId,
      groupId,
    });
  },

  removeNoteFromGroup(
    token: string,
    noteId: string
  ) {
    return request({
      action: "removeNoteFromGroup",
      token,
      noteId,
    });
  },

  pinNote(
    token: string,
    noteId: string,
    pinned: boolean
  ) {
    return request({
      action: "pinNote",
      token,
      noteId,
      pinned,
    });
  },

  async restoreNote(
  token: string,
  noteId: string
) {

  return request({

    action: "restoreNote",

    token,

    noteId

  });

},

async deleteForever(
  token: string,
  noteId: string
) {

  return request({

    action: "deleteForever",

    token,

    noteId

  });

},

  archiveNote(
    token: string,
    noteId: string,
    archived: boolean
  ) {
    return request({
      action: "archiveNote",
      token,
      noteId,
      archived,
    });
  },

  searchNotes(
    token: string,
    keyword: string
  ) {
    return request({
      action: "searchNotes",
      token,
      keyword,
    });
  },

  createGroup(
    token: string,
    name: string
  ) {
    return request({
      action: "createGroup",
      token,
      name,
    });
  },

  getGroups(token: string) {
    return request({
      action: "getGroups",
      token,
    });
  },

  renameGroup(
    token: string,
    groupId: string,
    name: string
  ) {
    return request({
      action: "renameGroup",
      token,
      groupId,
      name,
    });
  },

  deleteGroup(
    token: string,
    groupId: string
  ) {
    return request({
      action: "deleteGroup",
      token,
      groupId,
    });
  },

    getSharedNote(
    shareId: string
  ) {
    return request({
      action: "getSharedNote",
      shareId,
    });
  },

};