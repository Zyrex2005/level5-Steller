#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String,
};

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ReputationProfile {
    pub user: Address,
    pub total_ratings: u32,
    pub total_score: u32,
    pub completed_jobs: u32,
    pub badge_tier: String,
}

#[contracttype]
pub enum DataKey {
    Profile(Address),
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    /// Record a review/rating score (1-5 stars) for a user after a completed job
    pub fn record_rating(
        env: Env,
        reviewer: Address,
        user: Address,
        score: u32,
        _feedback: String,
    ) -> ReputationProfile {
        reviewer.require_auth();

        if score < 1 || score > 5 {
            panic!("Score must be between 1 and 5");
        }

        let key = DataKey::Profile(user.clone());
        let mut profile: ReputationProfile = env
            .storage()
            .instance()
            .get(&key)
            .unwrap_or(ReputationProfile {
                user: user.clone(),
                total_ratings: 0,
                total_score: 0,
                completed_jobs: 0,
                badge_tier: String::from_str(&env, "Bronze"),
            });

        profile.total_ratings += 1;
        profile.total_score += score;
        profile.completed_jobs += 1;

        let avg = (profile.total_score as u64 * 100) / profile.total_ratings as u64;

        profile.badge_tier = if profile.completed_jobs >= 10 && avg >= 450 {
            String::from_str(&env, "Diamond")
        } else if profile.completed_jobs >= 5 && avg >= 400 {
            String::from_str(&env, "Gold")
        } else if profile.completed_jobs >= 2 && avg >= 300 {
            String::from_str(&env, "Silver")
        } else {
            String::from_str(&env, "Bronze")
        };

        env.storage().instance().set(&key, &profile);

        env.events().publish(
            (symbol_short!("repute"), symbol_short!("rated")),
            (reviewer, user, score),
        );

        profile
    }

    /// Fetch profile rating score and badge tier for address
    pub fn get_profile(env: Env, user: Address) -> ReputationProfile {
        let key = DataKey::Profile(user.clone());
        env.storage()
            .instance()
            .get(&key)
            .unwrap_or(ReputationProfile {
                user: user.clone(),
                total_ratings: 0,
                total_score: 0,
                completed_jobs: 0,
                badge_tier: String::from_str(&env, "Bronze"),
            })
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_reputation_recording() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, ReputationContract);
        let client = ReputationContractClient::new(&env, &contract_id);

        let reviewer = Address::generate(&env);
        let user = Address::generate(&env);

        let feedback = String::from_str(&env, "Great work on the smart contract audit!");

        let profile = client.record_rating(&reviewer, &user, &5, &feedback);

        assert_eq!(profile.total_ratings, 1);
        assert_eq!(profile.total_score, 5);
        assert_eq!(profile.completed_jobs, 1);
        assert_eq!(profile.badge_tier, String::from_str(&env, "Bronze"));
    }

    #[test]
    fn test_badge_tier_upgrades() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, ReputationContract);
        let client = ReputationContractClient::new(&env, &contract_id);

        let reviewer = Address::generate(&env);
        let user = Address::generate(&env);
        let feedback = String::from_str(&env, "Excellent service");

        // 1st job - Bronze
        client.record_rating(&reviewer, &user, &5, &feedback);

        // 2nd job - Silver (>= 2 jobs, avg >= 4.0)
        let profile2 = client.record_rating(&reviewer, &user, &5, &feedback);
        assert_eq!(profile2.badge_tier, String::from_str(&env, "Silver"));

        // 3rd to 5th jobs - Gold (>= 5 jobs, avg >= 4.0)
        client.record_rating(&reviewer, &user, &5, &feedback);
        client.record_rating(&reviewer, &user, &5, &feedback);
        let profile5 = client.record_rating(&reviewer, &user, &5, &feedback);
        assert_eq!(profile5.badge_tier, String::from_str(&env, "Gold"));

        // Up to 10 jobs - Diamond (>= 10 jobs, avg >= 4.5)
        for _ in 0..5 {
            client.record_rating(&reviewer, &user, &5, &feedback);
        }
        let profile10 = client.get_profile(&user);
        assert_eq!(profile10.badge_tier, String::from_str(&env, "Diamond"));
    }
}
