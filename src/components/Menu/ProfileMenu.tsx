import { useCallback, useEffect, useState } from 'react'
import { Divider, Menu, MenuItem, styled } from '@mui/material'
import { follow } from '../../lens/follow'
import { useAppStore } from '../../stores'

const MenuHeading = styled(MenuItem)({})

const FollowItem = () => {
    const profileMenuId = useAppStore((state) => state.profileMenuId)
    const setProfileMenu = useAppStore((state) => state.setProfileMenu)
    const [isHandlingFollow, setIsHandlingFollow] = useState<boolean>(false)

    const handleFollow = async () => {
        if (!profileMenuId) return // TODO: show error
        setIsHandlingFollow(true)
        await follow({ profileId: profileMenuId })
        setIsHandlingFollow(false)
        setProfileMenu(null, null, null)
    }

    if (isHandlingFollow) return <MenuItem disabled>loading...</MenuItem>
    return <MenuItem onClick={handleFollow}>Follow</MenuItem>
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

    const onCloseProfileMenu = useCallback(() => {
        setProfileMenu(null, null, null)
    }, [setProfileMenu])

    // close profile menu on right-click
    useEffect(() => {
        document.addEventListener('contextmenu', onCloseProfileMenu)
        return () => {
            document.removeEventListener('contextmenu', onCloseProfileMenu)
        }
    }, [onCloseProfileMenu])

    if (!profileMenuPosition) return null

    return (
        <Menu
            open={!!profileMenuPosition && !!profileMenuHandle}
            onClose={onCloseProfileMenu}
            anchorReference='anchorPosition'
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