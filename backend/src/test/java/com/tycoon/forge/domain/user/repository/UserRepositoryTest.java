package com.tycoon.forge.domain.user.repository;

import com.tycoon.forge.domain.user.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.math.BigInteger;
import java.util.List;

import com.tycoon.forge.config.JpaConfig;
import org.springframework.context.annotation.Import;
import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Import(JpaConfig.class)
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("최고 레벨 랭킹 조회 테스트")
    void findTop10ByOrderByHighestLevelDesc() {
        // given
        createAndSaveUser("User1", 10, 100);
        createAndSaveUser("User2", 20, 200);
        createAndSaveUser("User3", 5, 50);

        // when
        List<User> ranking = userRepository.findTop10ByOrderByHighestLevelDesc();

        // then
        assertThat(ranking).hasSize(3);
        assertThat(ranking.get(0).getNickname()).isEqualTo("User2");
        assertThat(ranking.get(0).getHighestLevel()).isEqualTo(20);
        assertThat(ranking.get(1).getNickname()).isEqualTo("User1");
        assertThat(ranking.get(2).getNickname()).isEqualTo("User3");
    }

    @Test
    @DisplayName("부자 랭킹 조회 테스트")
    void findTop10ByOrderByGoldDesc() {
        // given
        createAndSaveUser("RichUser", 10, 10000);
        createAndSaveUser("PoorUser", 10, 100);
        createAndSaveUser("NormalUser", 10, 5000);

        // when
        List<User> ranking = userRepository.findTop10ByOrderByGoldDesc();

        // then
        assertThat(ranking).hasSize(3);
        assertThat(ranking.get(0).getNickname()).isEqualTo("RichUser");
        assertThat(ranking.get(0).getGold()).isEqualTo(new BigInteger("10000"));
        assertThat(ranking.get(1).getNickname()).isEqualTo("NormalUser");
        assertThat(ranking.get(2).getNickname()).isEqualTo("PoorUser");
    }

    private void createAndSaveUser(String nickname, int level, long gold) {
        User user = User.builder()
                .nickname(nickname)
                .build();
        user.updateHighestLevel(level);
        user.updateGold(BigInteger.valueOf(gold));
        userRepository.save(user);
    }
}
