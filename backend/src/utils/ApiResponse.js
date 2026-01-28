export class ApiResponse {
  constructor({ success = true, message = "OK", data = null, errors = [] }) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.errors = errors;
  }
}
