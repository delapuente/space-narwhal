
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

export { genFrames };
