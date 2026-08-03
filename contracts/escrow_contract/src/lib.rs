#![no_std]
use soroban_sdk::{
    contract, contractimpl, contracttype, symbol_short, Address, Env, String, Symbol,
};

#[contracttype]
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum JobStatus {
    Created = 0,
    Funded = 1,
    InReview = 2,
    Disputed = 3,
    Completed = 4,
    Refunded = 5,
}

#[contracttype]
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Job {
    pub id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub arbitrator: Address,
    pub amount: i128,
    pub title: String,
    pub category: String,
    pub status: JobStatus,
    pub created_at: u64,
}

#[contracttype]
pub enum DataKey {
    JobCount,
    Job(u64),
    Arbitrator,
}

const COUNTER: Symbol = symbol_short!("COUNTER");

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    /// Initialize contract with default arbitrator address
    pub fn initialize(env: Env, arbitrator: Address) {
        if env.storage().instance().has(&DataKey::Arbitrator) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Arbitrator, &arbitrator);
        env.storage().instance().set(&COUNTER, &0u64);
    }

    /// Create a new escrow job listing
    pub fn create_job(
        env: Env,
        client: Address,
        freelancer: Address,
        amount: i128,
        title: String,
        category: String,
    ) -> u64 {
        client.require_auth();

        if amount <= 0 {
            panic!("Amount must be greater than 0");
        }

        let arbitrator: Address = env
            .storage()
            .instance()
            .get(&DataKey::Arbitrator)
            .expect("Contract not initialized");

        let mut count: u64 = env.storage().instance().get(&COUNTER).unwrap_or(0);
        count += 1;

        let job = Job {
            id: count,
            client: client.clone(),
            freelancer: freelancer.clone(),
            arbitrator,
            amount,
            title: title.clone(),
            category: category.clone(),
            status: JobStatus::Created,
            created_at: env.ledger().timestamp(),
        };

        env.storage().instance().set(&DataKey::Job(count), &job);
        env.storage().instance().set(&COUNTER, &count);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("created")),
            (count, client, freelancer, amount),
        );

        count
    }

    /// Deposit funds into escrow job
    pub fn fund_job(env: Env, job_id: u64) -> bool {
        let mut job: Job = env
            .storage()
            .instance()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");

        job.client.require_auth();

        if job.status != JobStatus::Created {
            panic!("Job is not in Created state");
        }

        job.status = JobStatus::Funded;
        env.storage().instance().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("funded")),
            (job_id, job.amount),
        );

        true
    }

    /// Freelancer submits completed work for client review
    pub fn submit_work(env: Env, job_id: u64) -> bool {
        let mut job: Job = env
            .storage()
            .instance()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");

        job.freelancer.require_auth();

        if job.status != JobStatus::Funded {
            panic!("Job is not Funded");
        }

        job.status = JobStatus::InReview;
        env.storage().instance().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("review")),
            (job_id, job.freelancer.clone()),
        );

        true
    }

    /// Client approves work and releases funds to freelancer
    pub fn approve_job(env: Env, job_id: u64) -> bool {
        let mut job: Job = env
            .storage()
            .instance()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");

        job.client.require_auth();

        if job.status != JobStatus::InReview && job.status != JobStatus::Funded {
            panic!("Job cannot be approved in current state");
        }

        job.status = JobStatus::Completed;
        env.storage().instance().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("released")),
            (job_id, job.freelancer.clone(), job.amount),
        );

        true
    }

    /// Either party raises a dispute requiring arbitrator intervention
    pub fn raise_dispute(env: Env, job_id: u64, party: Address) -> bool {
        party.require_auth();

        let mut job: Job = env
            .storage()
            .instance()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");

        if party != job.client && party != job.freelancer {
            panic!("Only client or freelancer can raise dispute");
        }

        if job.status != JobStatus::Funded && job.status != JobStatus::InReview {
            panic!("Job status invalid for dispute");
        }

        job.status = JobStatus::Disputed;
        env.storage().instance().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("disputed")),
            (job_id, party),
        );

        true
    }

    /// Arbitrator resolves dispute in favor of client or freelancer
    pub fn resolve_dispute(env: Env, job_id: u64, favor_freelancer: bool) -> bool {
        let mut job: Job = env
            .storage()
            .instance()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");

        job.arbitrator.require_auth();

        if job.status != JobStatus::Disputed {
            panic!("Job is not in Disputed state");
        }

        if favor_freelancer {
            job.status = JobStatus::Completed;
        } else {
            job.status = JobStatus::Refunded;
        }

        env.storage().instance().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("resolved")),
            (job_id, favor_freelancer),
        );

        true
    }

    /// Client claims refund if job is created but unfunded/canceled
    pub fn refund_job(env: Env, job_id: u64) -> bool {
        let mut job: Job = env
            .storage()
            .instance()
            .get(&DataKey::Job(job_id))
            .expect("Job not found");

        job.client.require_auth();

        if job.status != JobStatus::Created {
            panic!("Only created/unfunded jobs can be refunded directly");
        }

        job.status = JobStatus::Refunded;
        env.storage().instance().set(&DataKey::Job(job_id), &job);

        env.events().publish(
            (symbol_short!("escrow"), symbol_short!("refunded")),
            (job_id, job.client.clone()),
        );

        true
    }

    /// Retrieve job details
    pub fn get_job(env: Env, job_id: u64) -> Job {
        env.storage()
            .instance()
            .get(&DataKey::Job(job_id))
            .expect("Job not found")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env, String};

    #[test]
    fn test_escrow_lifecycle() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let arbitrator = Address::generate(&env);
        let client_addr = Address::generate(&env);
        let freelancer_addr = Address::generate(&env);

        client.initialize(&arbitrator);

        let job_id = client.create_job(
            &client_addr,
            &freelancer_addr,
            &10000000i128,
            &String::from_str(&env, "Fullstack Web3 App"),
            &String::from_str(&env, "Development"),
        );

        assert_eq!(job_id, 1);

        // Fund
        let funded = client.fund_job(&job_id);
        assert!(funded);

        // Submit work
        let submitted = client.submit_work(&job_id);
        assert!(submitted);

        // Approve work
        let approved = client.approve_job(&job_id);
        assert!(approved);

        let job = client.get_job(&job_id);
        assert_eq!(job.status, JobStatus::Completed);
    }

    #[test]
    fn test_dispute_resolution() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let arbitrator = Address::generate(&env);
        let client_addr = Address::generate(&env);
        let freelancer_addr = Address::generate(&env);

        client.initialize(&arbitrator);

        let job_id = client.create_job(
            &client_addr,
            &freelancer_addr,
            &5000000i128,
            &String::from_str(&env, "Logo Redesign"),
            &String::from_str(&env, "Design"),
        );

        client.fund_job(&job_id);
        client.raise_dispute(&job_id, &client_addr);

        let job_after_dispute = client.get_job(&job_id);
        assert_eq!(job_after_dispute.status, JobStatus::Disputed);

        // Arbitrator resolves in favor of freelancer
        client.resolve_dispute(&job_id, &true);
        let resolved_job = client.get_job(&job_id);
        assert_eq!(resolved_job.status, JobStatus::Completed);
    }

    #[test]
    fn test_refund_unfunded_job() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let arbitrator = Address::generate(&env);
        let client_addr = Address::generate(&env);
        let freelancer_addr = Address::generate(&env);

        client.initialize(&arbitrator);

        let job_id = client.create_job(
            &client_addr,
            &freelancer_addr,
            &2500000i128,
            &String::from_str(&env, "Technical Writing"),
            &String::from_str(&env, "Writing"),
        );

        let refunded = client.refund_job(&job_id);
        assert!(refunded);

        let job = client.get_job(&job_id);
        assert_eq!(job.status, JobStatus::Refunded);
    }

    #[test]
    fn test_dispute_favor_client() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register_contract(None, EscrowContract);
        let client = EscrowContractClient::new(&env, &contract_id);

        let arbitrator = Address::generate(&env);
        let client_addr = Address::generate(&env);
        let freelancer_addr = Address::generate(&env);

        client.initialize(&arbitrator);

        let job_id = client.create_job(
            &client_addr,
            &freelancer_addr,
            &3000000i128,
            &String::from_str(&env, "Banner Art"),
            &String::from_str(&env, "Design"),
        );

        client.fund_job(&job_id);
        client.raise_dispute(&job_id, &freelancer_addr);
        client.resolve_dispute(&job_id, &false);

        let job = client.get_job(&job_id);
        assert_eq!(job.status, JobStatus::Refunded);
    }
}
