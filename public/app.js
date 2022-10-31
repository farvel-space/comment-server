console.log('hello world');
const socket = io('/general');

socket.on('initData', (data) => {
    console.log(data);
});

socket.on('getDataResp', (data) => {
    console.log(data);
})

socket.on('reflector', (data) => {
    console.log(data);
})

window.testNewComment = (data) => {
    socket.emit('newComment', data))
}

window.testAdminEdit = (sceneURL) => {
    socket.emit('getData', sceneURL)
}

window.testAdminEdit = (data) => {
    socket.emit('adminEdit', data)
}
