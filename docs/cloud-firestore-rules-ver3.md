rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- 1. 基础辅助函数 ---

    function isAuthenticated(req) {
      return req.auth != null;
    }

    function isValidVisibility(visibility) {
      return visibility in ['private', 'public', 'shared'];
    }

    // --- 2. 针对【当前文档】的权限检查 ---
    // 适用于: maps/{mapId}
    // 逻辑: 检查 resource.data (现有数据) 或 request.resource.data (新写入数据)
    function isResourceOwner(res, req) {
      return isAuthenticated(req) && res.data.ownerUid == req.auth.uid;
    }

    function isResourceReadable(res, req) {
      return isResourceOwner(res, req)
        || res.data.visibility == 'public'
        || (res.data.visibility == 'shared' && isAuthenticated(req));
    }

    // --- 3. 针对【父级地图】的权限检查 ---
    // 适用于: maps/{mapId}/pins/* 和 maps/{mapId}/polaroids/*
    // 逻辑: 使用 get() 获取父级 map 的数据
    function isParentMapOwner(db, mapId, req) {
      return isAuthenticated(req)
        && get(/databases/$(db)/documents/maps/$(mapId)).data.ownerUid == req.auth.uid;
    }

    function isParentMapReadable(db, mapId, req) {
      return isParentMapOwner(db, mapId, req)
        || get(/databases/$(db)/documents/maps/$(mapId)).data.visibility == 'public'
        || (get(/databases/$(db)/documents/maps/$(mapId)).data.visibility == 'shared'
            && isAuthenticated(req));
    }

    // --- 集合规则 ---

    match /users/{userId} {
      allow read: if true;
      allow write: if isAuthenticated(request) && request.auth.uid == userId;
    }

    match /maps/{mapId} {
      // Map 自身的读写不使用 get()，而是直接检查 resource

      // 读取: Owner / Public / Shared(仅登录用户)
      allow read: if isResourceReadable(resource, request);

      // 创建: 必须声明自己是 Owner，且 visibility 合法
      allow create: if isAuthenticated(request)
                    && request.resource.data.ownerUid == request.auth.uid
                    && isValidVisibility(request.resource.data.visibility);

      // 更新/删除: 必须是 Owner
      // 更新时仅当 visibility 字段存在时，校验它是否合法
      allow update: if isResourceOwner(resource, request)
                    && (!('visibility' in request.resource.data)
                        || isValidVisibility(request.resource.data.visibility));
      allow delete: if isResourceOwner(resource, request);

      // --- 子集合 (Pins & Polaroids) ---
      // 子集合读取遵循父级地图可见性；写入仍仅 Owner

      match /pins/{pinId} {
        allow read: if isParentMapReadable(database, mapId, request);
        allow write: if isParentMapOwner(database, mapId, request);
      }

      match /polaroids/{polaroidId} {
        allow read: if isParentMapReadable(database, mapId, request);
        allow create: if isParentMapOwner(database, mapId, request)
                      && request.resource.data.ownerUid == request.auth.uid;
        allow update, delete: if isParentMapOwner(database, mapId, request);
      }
    }
  }
}
