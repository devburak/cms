class FileInputNode {
  constructor(url, text) {
    this.url = url;
    this.text = text;
  }

  render() {
    return `<a href="${this.url}" download><strong>${this.text}</strong></a>`;
  }
}

export default FileInputNode;
