// Toggle like button
$(document).ready(function() {
    $('.like-btn').on('click', function() {
        $(this).toggleClass('unliked');
    });
});
