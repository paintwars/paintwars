import json
import numpy as np

from src.ai.utils import hash_address
from src.ai.placement.init import coords_to_id, grid_stake, grid_owner, grid_color
from src.models.paintwars.action.action_crud import ActionCall, ActionCreate, ActionMethod
from src.ai.placement.placement_budget import (
    compute_allocation_of_remaining_budget,
)


def generate_actions_for_placement(
    image_grid: np.ndarray,
    image_mask: np.ndarray,
    nbr_active_pixels: int,
    *,
    base_row: int,
    base_col: int,
    project_address: str,
    unused_budget: float
) -> list[ActionCreate]:
    project_id = hash_address(project_address)
    H, W = grid_color.shape
    h, w = image_grid.shape

    if base_row < 0 or base_col < 0 or base_col + w > W or base_row + h > H:
        raise ValueError("Image placement out of grid bounds")

    print("trying to build actions", flush=True)

    sub_color = grid_color[base_row : base_row + h, base_col : base_col + w]
    sub_owner = grid_owner[base_row : base_row + h, base_col : base_col + w]
    sub_stake = grid_stake[base_row : base_row + h, base_col : base_col + w]

    color_diff_mask = (sub_color != image_grid) & image_mask
    same_owner_mask = sub_owner == project_id
    stake_mask = color_diff_mask & ~same_owner_mask
    change_mask = color_diff_mask & same_owner_mask

    stake_coords = np.argwhere(stake_mask)

    print("built masks ====================", flush=True)
    # distribute any extra budget only to active pixels
    allocation = 0
    if unused_budget > 1 and len(stake_coords) > 0:
        allocation = unused_budget / len(stake_coords)

    stake_list = []
    for row, col in stake_coords:
        stake_amount = sub_stake[row, col] + allocation
        new_color = int(image_grid[row, col])
        stake_list.append(
            {
                "id": coords_to_id(row=base_row + row, col=base_col + col),
                "color": new_color,
                "amount": stake_amount * 1e18,
            }
        )

    print("built direct stake actions ====================", flush=True)

    change_coords = np.argwhere(change_mask)
    change_list = []
    for row, col in change_coords:
        new_color = int(image_grid[row, col])
        change_list.append(
            {
                "id": coords_to_id(row=base_row + row, col=base_col + col),
                "color": new_color,
            }
        )

    print("built actionsCreate ====================", flush=True)
    actions: list[ActionCreate] = []
    idx: int = 0
    stake_batch_size: int = 20
    change_batch_size: int = 20

    def chunkify(lst, n):
        for i in range(0, len(lst), n):
            yield lst[i : i + n]

    for chunk in chunkify(stake_list, stake_batch_size):
        print("id", [c["id"] for c in chunk], flush=True)
        print("amount", [c["amount"] for c in chunk], flush=True)
        print("effective_amount", [c["effective_amount"] for c in chunk], flush=True)
        print("color", [c["color"] for c in chunk], flush=True)
        action = ActionCreate(
            address=project_address,
            idx=idx,
            call=ActionCall(
                method=ActionMethod.stakePixels,
                pixelIds=[int(c["id"]) for c in chunk],
                amounts=[int(c["amount"]) for c in chunk],
                effective_amounts=[int(c["effective_amount"]) for c in chunk],
                colors=[int(c["color"]) for c in chunk],
            ),
            hash="pending",
        )
        actions.append(action)
        idx += 1

    for chunk in chunkify(change_list, change_batch_size):
        action = ActionCreate(
            address=project_address,
            idx=idx,
            call=ActionCall(
                method=ActionMethod.changeColors,
                pixelIds=[int(c["id"]) for c in chunk],
                colors=[int(c["color"]) for c in chunk],
            ),
            hash="pending",
        )
        actions.append(action)
        idx += 1

    return actions
