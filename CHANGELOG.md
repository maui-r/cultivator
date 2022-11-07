# [1.7.0](https://github.com/maui-r/cultivator/compare/v1.6.0...v1.7.0) (2022-11-07)


### Features

* add curvature to links ([b2f0457](https://github.com/maui-r/cultivator/commit/b2f04571944b7151155365d4ad9a8bcee041e01f))
* enable node drag ([c9ef06a](https://github.com/maui-r/cultivator/commit/c9ef06a027dae7f1c94cbc7fb3ecaf71c01e7842))
* increase link width ([51974c4](https://github.com/maui-r/cultivator/commit/51974c46e752974d78af49afdbfb9d137dd062f5))
* show arrows instead of particles ([26f77ce](https://github.com/maui-r/cultivator/commit/26f77ce30f49c5540de3c3f443c4b4526ec91bab))


### Performance Improvements

* disable dragging ([949590a](https://github.com/maui-r/cultivator/commit/949590a7159c4fcaf3c9a2dc5cc7b32ce4340245))
* memoize functions and values ([3522111](https://github.com/maui-r/cultivator/commit/3522111b99469fdd03d77b053c38bbe314396228))

# [1.6.0](https://github.com/maui-r/cultivator/compare/v1.5.0...v1.6.0) (2022-11-07)


### Features

* increase following limit ([0520e7c](https://github.com/maui-r/cultivator/commit/0520e7c21cba07c054ba9336bc59a691c2afa151))

# [1.5.0](https://github.com/maui-r/cultivator/compare/v1.4.0...v1.5.0) (2022-11-06)


### Features

* show picture of current profile ([4d7da75](https://github.com/maui-r/cultivator/commit/4d7da75b4afef2fca74f3717b99ec0fe5499b293))

# [1.4.0](https://github.com/maui-r/cultivator/compare/v1.3.0...v1.4.0) (2022-11-06)


### Bug Fixes

* clear optimistic cache when profile is switched ([1f68d56](https://github.com/maui-r/cultivator/commit/1f68d5608d34aec2faf880c8b1f91c8a0f807392))
* clear urql cache when user profile changes ([ee81029](https://github.com/maui-r/cultivator/commit/ee810294a675abb07b3486d5131fbc675d30f7f9))
* hide add followers button when profile has no followers ([22618d4](https://github.com/maui-r/cultivator/commit/22618d46fccf25e969eb771e36fb075d07a51af2))
* refetch profile data when user profile changes ([83e288b](https://github.com/maui-r/cultivator/commit/83e288b184712a3fb3ba1579b9aa641369932679))
* show stat name in singular when value is one ([54e87b1](https://github.com/maui-r/cultivator/commit/54e87b17cf0a1ce397bb804921d9ba24af5777b4))


### Features

* add unfollow button ([c3a2403](https://github.com/maui-r/cultivator/commit/c3a2403705d42e490cf6926ec9185527fa71f2dd))
* don't require profile to be set as default ([9b5bf50](https://github.com/maui-r/cultivator/commit/9b5bf5099412362ae0371baadd8b32b681e17d26))
* make follow optimistic ([7b43d93](https://github.com/maui-r/cultivator/commit/7b43d93d35b22dc3c907c51c58d932d938e45536))
* support optimistic proxy action follow ([949be0b](https://github.com/maui-r/cultivator/commit/949be0b6bcd0d856453aafb281e0adbb7021f616))


### Performance Improvements

* only update graph when nodes were added or removed ([0dc8f37](https://github.com/maui-r/cultivator/commit/0dc8f3769756cce70ca3babec4953d27440f7f84))

# [1.3.0](https://github.com/maui-r/cultivator/compare/v1.2.1...v1.3.0) (2022-11-02)


### Features

* add more profile stats ([0204f09](https://github.com/maui-r/cultivator/commit/0204f09fa721429b4ec9e07cf516b6e458230721))

## [1.2.1](https://github.com/maui-r/cultivator/compare/v1.2.0...v1.2.1) (2022-11-01)


### Bug Fixes

* switch to theme colors with higher contrast ([9fcc797](https://github.com/maui-r/cultivator/commit/9fcc7976539be005b286a615440b6b6009e996bb))

# [1.2.0](https://github.com/maui-r/cultivator/compare/v1.1.0...v1.2.0) (2022-11-01)


### Bug Fixes

* avoid disabled button as tooltip child ([14fdc8d](https://github.com/maui-r/cultivator/commit/14fdc8dfd173928adee26b0241bb0dd85c0ad898))
* avoid querying when follower list exhausted ([9700846](https://github.com/maui-r/cultivator/commit/9700846653a12e10ec2adfc86fffd6717ee3a9f4))
* convert jwt expiration time to milliseconds ([f4ea659](https://github.com/maui-r/cultivator/commit/f4ea6598dc3888a35775c9c866cf8705dda6b28d))
* remove <p> wrapper around <p> elements ([0b99dd2](https://github.com/maui-r/cultivator/commit/0b99dd26ea884f0cbf1e1e412d742513c824c16d))
* return auth state after refreshing expired token ([dc3fbe2](https://github.com/maui-r/cultivator/commit/dc3fbe200ab97097729d625c9ceedaebac9cdad3))
* use correct property when refreshing token ([4f4780a](https://github.com/maui-r/cultivator/commit/4f4780ad5d2d947fe8ba7330dcc4fe6bccb9b613))


### Features

* add avatar with menu ([9d7b1a7](https://github.com/maui-r/cultivator/commit/9d7b1a7ec82b8a727eb927bef4dac10a938e0c75))
* add connect wallet button ([b270f43](https://github.com/maui-r/cultivator/commit/b270f43640c2dfb93221da1d562a8a4d07dfadb0))
* add follow on lens functionality ([c169559](https://github.com/maui-r/cultivator/commit/c1695593728e56d97397923d15a01d70178fd515))
* add help dialog ([c75601e](https://github.com/maui-r/cultivator/commit/c75601e8ae4667cb0f7bdbce939cb98791302e42))
* add sign in functionality ([a02d030](https://github.com/maui-r/cultivator/commit/a02d030c3e0a4d3be199c3201d0c363b4a8b8362))
* add support for follow modules ([323778d](https://github.com/maui-r/cultivator/commit/323778d054817241701bca004daaea628408c2ab))
* close profile menu on right-click ([7e444dd](https://github.com/maui-r/cultivator/commit/7e444dda1a5bb8dcc8b982938cc51fe335f28a26))
* disable follow button when no wallet is connected ([b482c1c](https://github.com/maui-r/cultivator/commit/b482c1cef354ff5475ef2e58425146c474ed8569))
* make color mode changeable ([00b08e8](https://github.com/maui-r/cultivator/commit/00b08e8eda8c76efecb3af67d4e0e84953d1a7b4))
* open profile menu on right-click ([73316f7](https://github.com/maui-r/cultivator/commit/73316f7aef0dbf1011aad5d5dee792a0e5e8c288))
* show all follow connections between profiles ([6ef96c6](https://github.com/maui-r/cultivator/commit/6ef96c6dfbfa91cf1c93b4836068e9d9b56882a7))
* show info about selected node in sidebar ([b9b494e](https://github.com/maui-r/cultivator/commit/b9b494e9bb96e21ced033f118a9c211669cf0f20))
* show selected profile in sidebar ([36f537e](https://github.com/maui-r/cultivator/commit/36f537edf9a9d7290bd47285a88199f3004cfcfc))
* use proxy and broadcast for follow ([b5c5bab](https://github.com/maui-r/cultivator/commit/b5c5bab0788d4caedfefb04c8fdc57ef9e748e83))


### Performance Improvements

* use cache for profile details ([ddf516c](https://github.com/maui-r/cultivator/commit/ddf516cfdc083b0fed7dc447c3fe226834497021))

# [1.1.0](https://github.com/maui-r/cultivator/compare/v1.0.0...v1.1.0) (2022-09-30)


### Features

* add header ([95315b9](https://github.com/maui-r/cultivator/commit/95315b99d66c53a4fe7573d19b99b604f472a67a))
* add setting to change node style ([1099591](https://github.com/maui-r/cultivator/commit/1099591e45e4f1e34c6e2ac36ae1b16e5688ea8e))
* resize graph with window ([5fd9d29](https://github.com/maui-r/cultivator/commit/5fd9d299d61cc49ff84b44c2e3d85020763df0ef))
* set default node style to lens handle ([b565dc6](https://github.com/maui-r/cultivator/commit/b565dc61a66bfdcf98c70f5e1f63dab2b0339d6f))

# 1.0.0 (2022-09-29)


### Bug Fixes

* catch errors during handle retrieval ([09af0a9](https://github.com/maui-r/cultivator/commit/09af0a9b925f2ae70223411c1b08dbbcf575dffd))
* update fetching handle when returning early ([a6f7baa](https://github.com/maui-r/cultivator/commit/a6f7baac340b27b6d2eef9e0fa1b0836a2aa025c))


### Features

* add handle when pressing enter ([1c5edea](https://github.com/maui-r/cultivator/commit/1c5edeae3d1f4513b3af9822a4a05dca3fc12394))
* append .lens if handle not found ([2cd8611](https://github.com/maui-r/cultivator/commit/2cd86118ad55135c07d9e6a4aacdd6559a58ef3a))
* change theme colors ([08517fd](https://github.com/maui-r/cultivator/commit/08517fddbe5d70e18838841809f328ca3c6721a7))
* create-react-app ([ca8df7c](https://github.com/maui-r/cultivator/commit/ca8df7cc164c70ed3178e05dee2ee216904d5978))
* disable button while adding first handle ([7366af8](https://github.com/maui-r/cultivator/commit/7366af87f8b78f140ae898dcc00abb34285cee7c))
* fetch data interactively ([bb8e5c4](https://github.com/maui-r/cultivator/commit/bb8e5c4dc8751025e09b1e953c42172403d1ee84))
* install recoil ([e01a284](https://github.com/maui-r/cultivator/commit/e01a28468151df9293f4110a92989b2f1d6a4fb8))
* let user enter first handle manually ([a777017](https://github.com/maui-r/cultivator/commit/a777017f60061d115c9827181a9f95fc4946ff50))
* show errors in snackbar ([8832ecf](https://github.com/maui-r/cultivator/commit/8832ecf41d4bfb212249bbd8663108347906616a))
* show followers ([657f658](https://github.com/maui-r/cultivator/commit/657f658bf5caf15792523aa265022bf80ad2bdb9))
* show fully fetched nodes in yellow ([c53c0a5](https://github.com/maui-r/cultivator/commit/c53c0a5aa2d1cd51b7c51709630f652caae834e4))
* show graph of handle and following ([c84b45b](https://github.com/maui-r/cultivator/commit/c84b45b42a22ba741a7abb85c3ca9ac65fba7d4f))
* show nodes as text ([cd378b2](https://github.com/maui-r/cultivator/commit/cd378b27e307194b626be7a10aee1c80fdf09829))
* visualize link direction ([c9fff78](https://github.com/maui-r/cultivator/commit/c9fff7836441f2e5492e5e1361fc34e63b51488b))
