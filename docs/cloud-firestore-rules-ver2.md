rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // --- 1. 基础辅助函数 ---
    
    function isAuthenticated(req) {
      return req.auth != null;
    }

    // --- 2. 针对【当前文档】的权限检查 ---
    // 适用于: maps/{mapId}
    // 逻辑: 检查 resource.data (现有数据) 或 request.resource.data (新写入数据)
    function isResourceOwner(res, req) {
      return isAuthenticated(req) && res.data.ownerUid == req.auth.uid;
    }

    // --- 3. 针对【父级地图】的权限检查 ---
    // 适用于: maps/{mapId}/pins/* 和 maps/{mapId}/polaroids/*
    // 逻辑: 使用 get() 获取父级 map 的数据
    function isParentMapOwner(db, mapId, req) {
      return isAuthenticated(req) && 
             get(/databases/$(db)/documents/maps/$(mapId)).data.ownerUid == req.auth.uid;
    }

    // --- 集合规则 ---

    match /users/{userId} {
      allow read: if true;
      allow write: if isAuthenticated(request) && request.auth.uid == userId;
    }

    match /maps/{mapId} {
      // Map 自身的读写不使用 get()，而是直接检查 resource
      
      // 读取: 必须是 Owner
      // 这允许 where('ownerUid', '==', uid) 的查询通过
      allow read: if isResourceOwner(resource, request);

      // 创建: 必须声明自己是 Owner
      allow create: if isAuthenticated(request) 
                    && request.resource.data.ownerUid == request.auth.uid;

      // 更新/删除: 必须是 Owner
      allow update, delete: if isResourceOwner(resource, request);

      // --- 子集合 (Pins & Polaroids) ---
      // 这里的逻辑保持不变，因为子集合确实需要查父级 Map
      
      match /pins/{pinId} {
        allow read, write: if isParentMapOwner(database, mapId, request);
      }

      match /polaroids/{polaroidId} {
        allow read, update, delete: if isParentMapOwner(database, mapId, request);
        allow create: if isParentMapOwner(database, mapId, request) 
                      && request.resource.data.ownerUid == request.auth.uid;
      }
    }
  }
}
