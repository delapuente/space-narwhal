
type FromTo = Array<[number,number]|[number]>;
type ShortGenFrames = (name: string, ...seq: FromTo) => Array<string>;

function genFrames(prefix: string, suffix: string, digits: number) : ShortGenFrames {
  return function(name, ...seq) {
    const path = `${prefix ? prefix + '/' : ''}${name}/`;
    const names: Array<string> = [];
    seq.forEach(pair => {
      const from = pair[0];
      const to = pair.length === 1 ? from : pair[1];
      const frames = Phaser.Animation.generateFrameNames(
        path,
        from, to,
        suffix, digits
      );
      names.push(...frames);
    });
    return names;
  }
}

class SpaceNarwhalLoader extends Phaser.Loader {

  constructor(game: Phaser.Game) {
    super(game);
  }

  webfont(key: string, fontName: string, overwrite = false) : this {
    this.addToFileList('webfont', key, fontName);
    return this;
  }

  loadFile(file) {
    super.loadFile(file);
    if (file.type === 'webfont') {
      // file.url contains the web font
      document.fonts.load(`10pt "${file.url}"`).then(
        () => {
            this.asyncComplete(file);
        },
        () =>  {
            this.asyncComplete(file, `Error loading font ${file.url}`);
        }
      );
    }
  }

}

export { genFrames, SpaceNarwhalLoader };
