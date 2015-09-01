export function timestamp() {
    return new Date().getTime();
}

let music;

export function sound(name) {
    const sound = new Audio('sound/' + name + '.ogg');
    sound.play();
}
export function music(name) {
    music = new Audio('music/' + name + '.ogg');
    music.play();
}
