export function timestamp() {
    return new Date().getTime();
}

export function sound(name) {
    const sound = new Audio('sound/' + name + '.ogg');
    sound.play();
}