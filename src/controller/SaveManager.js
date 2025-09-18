export default class SaveManager {
    static save(id, x, y) {
        localStorage.setItem('saveData', JSON.stringify({
            savePointId: id,
            position: { x, y }
        }));
    }

    static load() {
        return JSON.parse(localStorage.getItem('saveData'));
    }
}