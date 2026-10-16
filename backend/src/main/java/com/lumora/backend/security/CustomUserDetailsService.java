package com.lumora.backend.security;

import com.lumora.backend.user.User;
import com.lumora.backend.user.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/** Nạp thông tin người dùng từ DB cho Spring Security (dùng email làm "username"). */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email.toLowerCase())
                .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy người dùng: " + email));

        // Tài khoản Google/Zalo không có mật khẩu (password_hash = null).
        // Spring Security bắt buộc trường password != null nên dùng chuỗi trống
        // làm placeholder — không ảnh hưởng vì xác thực dùng JWT, không phải form-login.
        String password = user.getPasswordHash() != null ? user.getPasswordHash() : "";

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(password)
                .authorities("USER")
                .build();
    }
}
