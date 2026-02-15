from google.adk.agents import LlmAgent
from .prompt import ROOT_AGENT_PROMPT
from .tools import (
    register_vessel,
    list_all_vessels,
    add_species,
    list_all_species,
    register_catch_batch,
    list_catch_batches,
    get_total_auctions,
    get_total_bids_for_auction,
    get_spoilage_prediction,
    get_high_risk_batches,
    auto_flag_high_risk_batches,
    get_temperature_logs,
    list_notifications,
)
from constants import AGENT_NAME, AGENT_DESCRIPTION, AGENT_MODEL


root_agent = LlmAgent(
    name=AGENT_NAME,
    model=AGENT_MODEL,
    description=AGENT_DESCRIPTION,
    instruction=ROOT_AGENT_PROMPT,
    tools=[
        # Vessel
        register_vessel,
        list_all_vessels,

        # Species
        add_species,
        list_all_species,

        # Catch
        register_catch_batch,
        list_catch_batches,

        # Auction analytics
        get_total_auctions,
        get_total_bids_for_auction,

        # Spoilage monitoring
        get_spoilage_prediction,
        get_high_risk_batches,
        auto_flag_high_risk_batches,

        # Storage
        get_temperature_logs,

        # Notifications
        list_notifications,
    ]
)
