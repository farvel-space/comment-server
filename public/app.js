console.log('hello world');
const socket = io('/general');

socket.on('initData', (data) => {
    console.log(data);
});

window.testNewComment = () => {
    socket.emit('newComment', {
        sceneID: "test",
        identifier: "naf-TEST123",
        comment: {
            commentId : "test",
            state : ["new", "active", "removed"],
            body : "tests",
            attr : ["displayName", "anonymous"]
        }
    })
}

window.testAdminEdit = () => {
    socket.emit('newComment', {
        sceneID: "test",
        identifier: "naf-TEST123",
        comment: {
            commentId : "test",
            state : ["new", "active", "removed"],
            body : "tests",
            attr : ["displayName", "anonymous"]
        }
    })
}

window.testAdminEdit = () => {
    socket.emit('newComment', "gimme data")
}
