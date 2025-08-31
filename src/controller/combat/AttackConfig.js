const AttackConfig = {
    cooldown: 400,
    duration: 200,
    knockbackPower: 150,
    hitboxes: {
        forward: { width: 145, height: 132, offsetX: 100, offsetY: 0 },
        up: { width: 140, height: 82, offsetX: 20, offsetY: -80 },
        down: { width: 140, height: 55, offsetX: 20, offsetY: 60 },
        forwardLeft: { width: 70, height: 60, offsetX: -30, offsetY: 0 },
        forwardRight: { width: 70, height: 60, offsetX: 30, offsetY: 0 },
    },
    speedCompMax: 20,
    speedCompFactor: 0.1,
    verticalBounce: -400
};

export default AttackConfig;