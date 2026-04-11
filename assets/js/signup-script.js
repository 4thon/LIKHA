$(document).ready(function() {
    // Form validation and submission
    $('#signupForm').on('submit', function(e) {
        e.preventDefault();
        
        var name = $('#name').val().trim();
        var email = $('#email').val().trim();
        var phone = $('#phone').val().trim();
        var password = $('#password').val();
        var confirmPassword = $('#confirmPassword').val();
        var loginMethod = $('input[name="loginMethod"]:checked').val();
        var termsAccepted = $('#terms').is(':checked');

        clearFieldErrors();
        
        // Validation
        if (!name || !email || !phone || !password || !confirmPassword) {
            if (!name) showFieldError('name', 'Name is required.');
            if (!email) showFieldError('email', 'Email is required.');
            if (!phone) showFieldError('phone', 'Phone number is required.');
            if (!password) showFieldError('password', 'Password is required.');
            if (!confirmPassword) showFieldError('confirmPassword', 'Please confirm your password.');
            return;
        }
        
        // Name validation (at least 2 characters)
        if (name.length < 2) {
            showFieldError('name', 'Please enter a valid name.');
            $('#name').focus();
            return;
        }
        
        // Email validation
        var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFieldError('email', 'Please enter a valid email address.');
            $('#email').focus();
            return;
        }

        // Phone validation
        var phoneDigits = phone.replace(/\D/g, '');
        if (phoneDigits.length < 9) {
            showFieldError('phone', 'Please enter a valid phone number.');
            $('#phone').focus();
            return;
        }
        
        // Password validation (at least 6 characters)
        if (password.length < 6) {
            showFieldError('password', 'Password must be at least 6 characters long.');
            $('#password').focus();
            return;
        }

        if (password !== confirmPassword) {
            showFieldError('confirmPassword', 'Passwords do not match.');
            $('#confirmPassword').focus();
            return;
        }

        if (!loginMethod) {
            showFieldError('loginMethod', 'Please select a login method.');
            return;
        }
        
        // Terms validation
        if (!termsAccepted) {
            showFieldError('terms', 'Please accept the terms & policy.');
            return;
        }
        
        // Simulate signup
        console.log('Signup attempt:', { 
            name: name, 
            email: email, 
            phone: phone,
            password: password,
            termsAccepted: termsAccepted,
            loginMethod: loginMethod
        });

        if (window.LikhaStore) {
            window.LikhaStore.set('likhaLoginMethod', loginMethod);
        } else {
            localStorage.setItem('likhaLoginMethod', loginMethod);
        }
        
        // Add loading state to button
        var $btn = $('.primary-btn');
        var originalText = $btn.text();
        $btn.text('Creating account...').prop('disabled', true);
        
        // Simulate API call
        setTimeout(function() {
            $btn.text(originalText).prop('disabled', false);
            alert('Account created successfully for: ' + name + '\nEmail: ' + email);
            hideError();
            
            // Optionally redirect to login page
            // window.location.href = 'index.html';
        }, 1500);
    });
    
    // Input focus animations
    $('.input-field').on('focus', function() {
        $(this).parent().addClass('focused');
    }).on('blur', function() {
        $(this).parent().removeClass('focused');
    });
    
    // Real-time password strength indicator
    $('#password').on('input', function() {
        var password = $(this).val();
        var strength = 'weak';
        
        if (password.length >= 6) {
            strength = 'medium';
        }
        if (password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
            strength = 'strong';
        }
        
        console.log('Password strength:', strength);
    });
    
    // Checkbox styling enhancement
    $('#terms').on('change', function() {
        if ($(this).is(':checked')) {
            $(this).parent().addClass('checked');
            $('[data-error-for="terms"]').text('').removeClass('active');
            hideError();
        } else {
            $(this).parent().removeClass('checked');
        }
    });
    
    // Error message functions
        function showFieldError(fieldId, message) {
        var $error = $('[data-error-for="' + fieldId + '"]');
        if ($error.length) {
            $error.text(message).addClass('active');
        }
    }

    function clearFieldErrors() {
        $('.field-error').text('').removeClass('active');
    }
    
    function showError(message) {
        $('#errorMessage').text(message).addClass('show');
        setTimeout(hideError, 5000);
    }
    
    function hideError() {
        $('#errorMessage').removeClass('show');
    }
    
    // Hover effects for nav items
    $('.nav-item a').hover(
        function() {
            if (!$(this).hasClass('active')) {
                $(this).css('opacity', '0.7');
            }
        },
        function() {
            $(this).css('opacity', '1');
        }
    );
    
    // Sign In link click
    $('.signin-link').on('click', function(e) {
        console.log('Redirecting to sign in page');
    });
    
    // Enter key submit prevention on individual fields (optional)
    $('.input-field').on('keypress', function(e) {
        if (e.which === 13) { // Enter key
            e.preventDefault();
            var $inputs = $('.input-field');
            var currentIndex = $inputs.index(this);
            
            // Move to next input or submit if last
            if (currentIndex < $inputs.length - 1) {
                $inputs.eq(currentIndex + 1).focus();
            } else {
                $('#signupForm').submit();
            }
        }
    });

    // Toggle password visibility
    $('[data-toggle-password]').on('click', function() {
        var targetId = $(this).data('target');
        var $input = $('#' + targetId);
        if (!$input.length) return;
        var isHidden = $input.attr('type') === 'password';
        $input.attr('type', isHidden ? 'text' : 'password');
        $(this).attr('aria-label', isHidden ? 'Hide password' : 'Show password');
    });
    
    console.log('Signup page loaded successfully with jQuery');
});
