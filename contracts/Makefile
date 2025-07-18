# Makefile

ifneq (,$(wildcard ./.env))
    include .env
    export $(shell sed 's/=.*//' .env)
endif

CONTRACTS_DIR = ./out
CONTRACTS = PixelStaking MintableToken PixelStakingOApp
FRONTEND_ABI_DIR = ../app/src/abis
BACKEND_ABI_DIR = ../backend/src/contracts/abis

.DEFAULT_GOAL := help

# 3) Foundry commands
build: ## Build the contracts
	@forge build

tests: ## Run tests
	@forge test --gas-report

coverage: ## Run coverage
	@forge coverage

clean: ## Remove artifacts (build cache, etc.)
	@rm -rf out
	@rm -rf cache

copy: build
	@echo "Copying ABI..."
	@for contract in $(CONTRACTS); do \
    	cp $(CONTRACTS_DIR)/$$contract.sol/$$contract.json $(FRONTEND_ABI_DIR); \
    	cp $(CONTRACTS_DIR)/$$contract.sol/$$contract.json $(BACKEND_ABI_DIR); \
	done
	@echo "ABI files copied successfully!"

# 4) Example deploy script - fill in your details
deploy: ## Deploy contract(s) to the specified network
	@echo "Deploying contracts to network..."
	@forge script script/Deploy.s.sol \
		--rpc-url $(RPC_URL) \
		--private-key $(PRIVATE_KEY) \
		--broadcast
	@echo "Deployment completed! Contract addresses are shown above."


# 5) Utility target: help
help: ## Show available Make targets
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@awk 'BEGIN {FS = ":.*##"; printf "\n"} /^[a-zA-Z0-9\-_]+:.*?##/ \
		{ printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)

# approve: ## Approve PixelStaking contract to spend tokens. Usage: make approve amount=<value>
# 	@echo "Approving $(PIXEL_STAKING_ADDRESS)) to spend $(amount) tokens from contract $(STAKING_TOKEN_ADDRESS)..."
# 	@cast send $(STAKING_TOKEN_ADDRESS) "approve(address,uint256)" $(PIXEL_STAKING_ADDRESS)) "$(amount)" --private-key $(PRIVATE_KEY) --rpc-url $(RPC_URL)

approve: ## Approve PixelStaking contract to spend tokens. Usage: make approve amount=<value>
	@echo "Approving $(subst ",,$(strip $(PIXEL_STAKING_ADDRESS))) to spend $(amount) tokens from contract $(subst ",,$(strip $(STAKING_TOKEN_ADDRESS)))..."
	@cast send $(subst ",,$(strip $(STAKING_TOKEN_ADDRESS))) "approve(address,uint256)" $(subst ",,$(strip $(PIXEL_STAKING_ADDRESS))) "$(amount)" --private-key $(subst ",,$(strip $(PRIVATE_KEY))) --rpc-url $(subst ",,$(strip $(RPC_URL)))

applySpell: ## Apply a spell on a pixel. Usage: make applySpell spellType=<0–3> pixelId=<id> newPixelId=<id>
	@echo "Applying spell type=$(spellType) on pixel=$(pixelId) target=$(newPixelId)"
	@cast send $(PIXEL_STAKING_ADDRESS) \
	  "applySpell(uint8,uint16,uint16)" \
	  $(spellType) $(pixelId) $(newPixelId) \
	  --private-key $(PRIVATE_KEY) \
	  --rpc-url $(RPC_URL)

changePixel: ## Call stakePixel method on the PixelStaking contract. Usage: make stake pixelId=<value> amount=<value> color=<value>
	@echo "Calling stakePixel(pixelId, amount, color) on contract $(PIXEL_STAKING_ADDRESS)..."
	@cast send $(PIXEL_STAKING_ADDRESS) "changePixelCrossChain(uint16,address,uint256,uint24)" $(pixelId) $(STAKING_TOKEN_ADDRESS) "$(amount)" $(color) --private-key $(PRIVATE_KEY) --rpc-url $(RPC_URL)


runActions: ## Batch multiple actions. Usage: make runActions actions='<array-literal>'
	@echo "Running actions: $(actions)"
	@cast send $(PIXEL_STAKING_ADDRESS) \
	  "runActions((uint16,uint16,uint8,uint8,uint24,uint256,address)[])" \
	  '$(actions)' \
	  --private-key $(PRIVATE_KEY) \
	  --rpc-url $(RPC_URL)



# mint: ## Call mint(address to, uint256 amount) on your contract. Usage: make mint to=<recipient_address> amount=<value>
# 	@echo "Minting tokens to $(to) with amount $(amount) on contract $(STAKING_TOKEN_ADDRESS)..."
# 	@cast send $(STAKING_TOKEN_ADDRESS) "mint(address,uint256)" $(to) $(amount) --private-key $(PRIVATE_KEY) --rpc-url $(RPC_URL)
