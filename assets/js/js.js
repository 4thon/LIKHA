$(document).ready(function() {
    // Form validation and submission
    $('#loginForm').on('submit', function(e) {
        e.preventDefault();
        
        var email = $('#email').val();
        var password = $('#password').val();
        
        // Simple validation
        if (!email || !password) {
            showError('Please fill in all fields');
            return;
        }
        
        // Email validation
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showError('Please enter a valid email address');
            return;
        }
        
        // Simulate login
        console.log('Login attempt:', { email: email, password: password });
        
        // Add loading state to button
        var $btn = $('.login-btn');
        var originalText = $btn.text();
        $btn.text('Logging in...').prop('disabled', true);
        
        // Simulate API call
        setTimeout(function() {
            $btn.text(originalText).prop('disabled', false);
            alert('Login attempt with email: ' + email);
            hideError();
        }, 1000);
    });
    
    // Forgot password click
    $('#forgotPassword').on('click', function(e) {
        e.preventDefault();
        var email = $('#email').val();
        
        if (email) {
            alert('Password reset link would be sent to: ' + email);
        } else {
            alert('Please enter your email address first');
            $('#email').focus();
        }
    });
    
    // Register link click
    $('#registerLink').on('click', function(e) {
        e.preventDefault();
        alert('Redirecting to registration page');
    });
    
    // Input focus animations
    $('.input-field').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });
    
    // Error message functions
    function showError(message) {
        $('#errorMessage').text(message).addClass('show');
        setTimeout(hideError, 5000);
    }
    
    function hideError() {
        $('#errorMessage').removeClass('show');
    }
    
    // Hover effects for nav items
    $('.nav-item').hover(
        function() {
            $(this).css('opacity', '0.7');
        },
        function() {
            $(this).css('opacity', '1');
        }
    );
    
    console.log('Login page loaded successfully with jQuery');
});