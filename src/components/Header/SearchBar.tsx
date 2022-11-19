import { useEffect, useState } from 'react'
import { Autocomplete, Box, Grid, TextField, Typography } from '@mui/material'
import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import { useSnackbar } from 'notistack'
import { getProfileNode } from '../../lens/profile'
import { TooManyFollowingException } from '../../errors'
import { useAppStore, useNodeStore } from '../../stores'
import { useQuery } from 'urql'
import { graphql } from '../../lens/schema'
import { SearchRequestTypes } from '../../lens/schema/graphql'

const SearchQuery = graphql(`
query Search($request: SearchQueryRequest!) {
  search(request: $request) {
    ... on ProfileSearchResult {
      __typename 
      items {
        ... on Profile {
          id
          name
          handle
        }
      }
    }
  }
}
`)

interface Profile {
  id: string
  handle: string
  name?: string | null
}
export const SearchBar = () => {
  const nodes = useNodeStore((state) => state.nodes)
  const addNodes = useNodeStore((state) => state.addNodes)
  const selectNode = useAppStore((state) => state.selectNode)
  const isQuerying = useAppStore((state) => state.isQuerying)
  const setIsQuerying = useAppStore((state) => state.setIsQuerying)
  const { enqueueSnackbar } = useSnackbar()
  const [inputValue, setInputValue] = useState<string>('')
  const [options, setOptions] = useState<Profile[]>([])
  const [{ data, fetching, operation }, search] = useQuery({
    query: SearchQuery,
    variables: {
      request: {
        query: inputValue,
        type: SearchRequestTypes.Profile,
        limit: 10,
      }
    },
    pause: true,
  })
  const loading = fetching && options.length === 0

  const handleSelectSearchResult = async (event: any, newValue: Profile | null) => {
    if (isQuerying || !newValue) return

    try {
      setIsQuerying(true)

      if (nodes.hasOwnProperty(newValue.id)) {
        // Profile already present
        selectNode(newValue.id)
        return
      }

      try {
        const { profile } = await getProfileNode(newValue.handle)
        addNodes([profile])
        selectNode(profile.id)
        return
      } catch (error) {
        if (error instanceof TooManyFollowingException) {
          enqueueSnackbar(`@${newValue.handle} is following too many profiles`, { variant: 'error' })
          return
        }
        enqueueSnackbar('Something went wrong...', { variant: 'error' })
      }
    } finally {
      setInputValue('')
      setOptions([])
      setIsQuerying(false)
    }
  }

  useEffect(() => {
    if (fetching) return
    if (isQuerying) return
    if (data?.search?.__typename !== 'ProfileSearchResult') return

    const newOptions: Profile[] = []
    data.search.items.forEach((i) => {
      if (
        i.__typename !== 'Profile'
        || typeof i.id !== 'string'
        || typeof i.handle !== 'string'
      ) {
        return
      }
      newOptions.push(i)
    })
    setOptions(newOptions)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetching, data])

  useEffect(() => {
    if (inputValue === '') {
      setOptions([])
      return
    }

    if (
      operation
      &&
      !inputValue.includes(operation.variables.request.query)
      &&
      !operation.variables.request.query.includes(inputValue)
    ) {
      // previous search contradicts current search
      setOptions([])
    }

    search()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputValue])

  return (
    <Autocomplete
      id='search'
      size='small'
      sx={{ width: 300 }}
      loading={loading}
      disabled={isQuerying}
      getOptionLabel={(option) => option.name ?? option.handle}
      filterOptions={(x) => x} // disable built-in filtering
      options={options}
      autoComplete
      autoHighlight
      clearOnEscape
      onChange={handleSelectSearchResult}
      onInputChange={(event, newInputValue) => { setInputValue(newInputValue) }}
      renderInput={(params) => (<TextField {...params} label='Search handle' fullWidth />)}
      renderOption={(props, option) => {
        return (
          <li {...props} key={option.id}>
            <Grid container alignItems='center'>
              <Grid item>
                <Box
                  component={AccountCircleIcon}
                  sx={{ color: 'text.secondary', mr: 2 }}
                />
              </Grid>
              <Grid item xs>
                {option.name ?? option.handle}
                <Typography variant='body2' color='text.secondary'>
                  @{option.handle}
                </Typography>
              </Grid>
            </Grid>
          </li>
        )
      }}
    />
  )
}