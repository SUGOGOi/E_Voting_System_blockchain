use anchor_lang::prelude::*;
use anchor_lang::solana_program::hash::hash;

declare_id!("5dqd27fMiBV5DZd4DdnZw7Qd2XBAVt8LZKDRGxLK99Ng");

// Fixed salt for consistent hashing
const FIXED_SALT: &str = "voting_system_salt_2025_secure";

#[program]
pub mod online_voting_system {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let state = &mut ctx.accounts.state;
        state.admin = ctx.accounts.admin.key();
        state.voter_count = 0;
        state.candidate_count = 0;
        Ok(())
    }

    pub fn transfer_admin(ctx: Context<TransferAdmin>, new_admin: Pubkey) -> Result<()> {
        let state = &mut ctx.accounts.state;
        require!(
            ctx.accounts.admin.key() == state.admin,
            ErrorCode::Unauthorized
        );
        state.admin = new_admin;
        Ok(())
    }

    pub fn add_candidate(
        ctx: Context<AddCandidate>,
        candidate_id: u64,
        name: String,
        political_party: String,
    ) -> Result<()> {
        require!(name.len() > 0, ErrorCode::InvalidName);
        require!(political_party.len() > 0, ErrorCode::InvalidParty);

        let candidate = &mut ctx.accounts.candidate;
        candidate.name = name;
        candidate.political_party = political_party;
        candidate.vote_count = 0;
        candidate.candidate_id = candidate_id;
        candidate.creator = ctx.accounts.admin.key();

        let state = &mut ctx.accounts.state;
        state.candidate_count += 1;

        Ok(())
    }

    pub fn add_voter(
        ctx: Context<AddVoter>,
        _name: String,
        _voter_id: u64,
        _dob: String,
    ) -> Result<()> {
        let voter = &mut ctx.accounts.voter;
        voter.has_voted = false;
        voter.creator = ctx.accounts.admin.key();

        let state = &mut ctx.accounts.state;
        state.voter_count += 1;

        Ok(())
    }

    pub fn vote(ctx: Context<Vote>, _voter_hash: [u8; 32], _candidate_id: u64) -> Result<()> {
        let voter = &mut ctx.accounts.voter;
        let candidate = &mut ctx.accounts.candidate;

        require!(!voter.has_voted, ErrorCode::AlreadyVoted);

        candidate.vote_count += 1;
        voter.has_voted = true;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct TransferAdmin<'info> {
    #[account(mut, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(mut, address = state.admin @ ErrorCode::Unauthorized)]
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = admin, space = 8 + 32 + 8 + 8, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(mut)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(candidate_id: u64, name: String, political_party: String)]
pub struct AddCandidate<'info> {
    #[account(mut, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(
        init,
        payer = admin,
        space = 8 + 64 + 64 + 8 + 8 + 32,
        seeds = [b"candidate", candidate_id.to_le_bytes().as_ref()],
        bump
    )]
    pub candidate: Account<'info, Candidate>,
    #[account(mut, address = state.admin @ ErrorCode::Unauthorized)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(name: String, voter_id: u64, dob: String)]
pub struct AddVoter<'info> {
    #[account(mut, seeds = [b"state"], bump)]
    pub state: Account<'info, State>,
    #[account(
        init,
        payer = admin,
        space = 8 + 1 + 32,
        seeds = [b"voter", hash(format!("{}{}{}{}", name, dob, voter_id, FIXED_SALT).as_bytes()).to_bytes().as_ref()],
        bump
    )]
    pub voter: Account<'info, Voter>,
    #[account(mut, address = state.admin @ ErrorCode::Unauthorized)]
    pub admin: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(voter_hash: [u8; 32], candidate_id: u64)]
pub struct Vote<'info> {
    #[account(mut, seeds = [b"voter", voter_hash.as_ref()], bump)]
    pub voter: Account<'info, Voter>,
    #[account(mut, seeds = [b"candidate", candidate_id.to_le_bytes().as_ref()], bump)]
    pub candidate: Account<'info, Candidate>,
    pub signer: Signer<'info>,
}

#[account]
pub struct Candidate {
    pub name: String,
    pub political_party: String,
    pub candidate_id: u64,
    pub vote_count: u64,
    pub creator: Pubkey,
}

#[account]
pub struct Voter {
    pub has_voted: bool,
    pub creator: Pubkey,
}

#[account]
pub struct State {
    pub admin: Pubkey,
    pub voter_count: u64,
    pub candidate_count: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("The name cannot be empty.")]
    InvalidName,
    #[msg("Political party cannot be empty.")]
    InvalidParty,
    #[msg("Voter has already voted.")]
    AlreadyVoted,
    #[msg("Unauthorized action.")]
    Unauthorized,
    #[msg("Voter with this ID already exists.")]
    VoterAlreadyExists,
    #[msg("Candidate with this ID already exists.")]
    CandidateAlreadyExists,
    #[msg("PDA address does not match expected address.")]
    InvalidVoterAddress,
    #[msg("PDA address does not match expected address.")]
    InvalidCandidateAddress,
}
