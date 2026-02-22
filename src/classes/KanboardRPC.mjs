import axios from 'axios';

axios.defaults.timeout = 3000;

class KanboardRPC {

  constructor(kanboardUrl, apiToken) {
    this.kanboardUrl = kanboardUrl;
    this.apiToken = apiToken;
    axios.defaults.headers.post['Authorization'] = apiToken;
  }

  //-------------------------------------------------------------------------
  async callKanboard(method, params = {}) {
    try {
      const datas = {
        jsonrpc: '2.0',
        method: method,
        id: 1,
        params: params,
      }
      //console.log('callKanboard() ',datas)
      const response = await axios.post(this.kanboardUrl, datas);
      if (response.data && response.data.result !== undefined) {
        //console.log('callKanboard() Ok',datas)
        return response.data.result;
      } else {
        console.error(`callKanboard() Unexpected response ${method}:`, response.data);
        return [];
      }
    } catch (error) {
      console.error(`callKanboard() Error when calling  ${method}:`, error.response?.data || error.message);
      throw error;
    }
  }
  //-------------------------------------------------------------------------------
  async getAllTags() {
    return this.callKanboard('getAllTags', {
    });
  }

  //-------------------------------------------------------------------------------
  async getTags(projectId) {
    return this.callKanboard('getTagsByProject', {
      project_id: projectId,
    });
  }

  //-------------------------------------------------------------------------------
  async getProjects() {
    return this.callKanboard('getAllProjects', {
    });
  }

  //-------------------------------------------------------------------------------
  async getBoard(projectId) {
    let result = this.callKanboard('getBoard', { project_id: projectId });
    return (result)
  }

  //-------------------------------------------------------------------------------
  async getTasks(projectId) {
    return this.callKanboard('getAllTasks', {
      project_id: projectId,
    });
  }

  //------------------------------------------------------------------------------
  async getColumns(projectId) {
    return this.callKanboard('getColumns', {
      project_id: projectId,
    });
  }

  //-------------------------------------------------------------------------------
  async getSwimlanes(projectId) {
    return this.callKanboard('getAllSwimlanes', [projectId]);
  }
}

export { KanboardRPC }