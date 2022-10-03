import { Divider, Menu, MenuItem, styled } from '@mui/material'
import { useAccount } from 'wagmi'
import { useAppStore } from '../../stores'

const MenuHeading = styled(MenuItem)({})

const FollowItem = () => {
    const { address } = useAccount()
    const onFollow = () => {
        // TODO
    }

    // disabled if no wallet connected
    if (!address) return (
        <MenuItem disabled={true}>Follow</MenuItem>
    )

    return (
        <MenuItem onClick={onFollow}>Follow</MenuItem>
    )
}

const ShowOnLensFrensItem = () => {
    const profileMenuHandle = useAppStore((state) => state.profileMenuHandle)
    const onShowOnLensFrens = () => {
        window.open(
            `https://lensfrens.xyz/${profileMenuHandle}`,
            '_blank'
        )
    }

    return <MenuItem onClick={onShowOnLensFrens}>Show on LensFrens</MenuItem>
}

const ProfileMenu = () => {
    const profileMenuPosition = useAppStore((state) => state.profileMenuPosition)
    const profileMenuHandle = useAppStore((state) => state.profileMenuHandle)
    const setProfileMenu = useAppStore((state) => state.setProfileMenu)

    if (!profileMenuPosition) return null

    const onCloseProfileMenu = () => {
        setProfileMenu(null, null)
    }

    return (
        <Menu
            open={!!profileMenuPosition && !!profileMenuHandle}
            onClose={onCloseProfileMenu}
            anchorReference="anchorPosition"
            anchorPosition={profileMenuPosition}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'left',
            }}
        >
            <MenuHeading>{profileMenuHandle}</MenuHeading>
            <Divider />
            <FollowItem />
            <ShowOnLensFrensItem />
        </Menu >
    )
}

export default ProfileMenu