package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"

	"sku-rumahsakit/config"
)

type SupabaseRepository struct {
	baseURL   string
	anonKey   string
	serviceKey string
	client    *http.Client
}

func NewSupabaseRepository(env *config.Env) *SupabaseRepository {
	return &SupabaseRepository{
		baseURL:    env.SupabaseURL,
		anonKey:    env.SupabaseAnonKey,
		serviceKey: env.SupabaseServiceKey,
		client:     &http.Client{},
	}
}

func (r *SupabaseRepository) doRequest(ctx context.Context, method, path, body string, serviceRole bool) ([]byte, int, error) {
	url := r.baseURL + path
	
	var authKey string
	if serviceRole {
		authKey = r.serviceKey
	} else {
		authKey = r.anonKey
	}

	req, err := http.NewRequestWithContext(ctx, method, url, strings.NewReader(body))
	if err != nil {
		return nil, 0, err
	}

	req.Header.Set("apikey", authKey)
	req.Header.Set("Authorization", "Bearer "+authKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Prefer", "return=representation")

	resp, err := r.client.Do(req)
	if err != nil {
		return nil, 0, err
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, resp.StatusCode, err
	}

	return respBody, resp.StatusCode, nil
}

func (r *SupabaseRepository) List(table string, query string) ([]map[string]any, error) {
	path := fmt.Sprintf("/rest/v1/%s?%s", table, query)
	body, status, err := r.doRequest(context.Background(), "GET", path, "", false)
	if err != nil {
		return nil, err
	}
	if status != 200 && status != 206 {
		return nil, fmt.Errorf("list %s failed: status %d, body: %s", table, status, string(body))
	}

	// Handle array response
	if len(body) > 0 && body[0] == '[' {
		var result []map[string]any
		if err := json.Unmarshal(body, &result); err != nil {
			return nil, err
		}
		return result, nil
	}

	// Handle empty
	return []map[string]any{}, nil
}

func (r *SupabaseRepository) Get(table string, id string) (map[string]any, error) {
	path := fmt.Sprintf("/rest/v1/%s?id=eq.%s", table, id)
	body, status, err := r.doRequest(context.Background(), "GET", path, "", false)
	if err != nil {
		return nil, err
	}
	if status != 200 {
		return nil, fmt.Errorf("get %s failed: status %d", table, status)
	}

	var result []map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	if len(result) == 0 {
		return nil, fmt.Errorf("not found")
	}
	return result[0], nil
}

func (r *SupabaseRepository) Insert(table string, data map[string]any) (map[string]any, error) {
	jsonData, _ := json.Marshal(data)
	path := fmt.Sprintf("/rest/v1/%s", table)
	body, status, err := r.doRequest(context.Background(), "POST", path, string(jsonData), true)
	if err != nil {
		return nil, err
	}
	if status != 201 && status != 200 {
		return nil, fmt.Errorf("insert %s failed: status %d, body: %s", table, status, string(body))
	}

	var result []map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		// Maybe no return representation
		return data, nil
	}
	if len(result) > 0 {
		return result[0], nil
	}
	return data, nil
}

func (r *SupabaseRepository) Update(table string, id string, data map[string]any) (map[string]any, error) {
	jsonData, _ := json.Marshal(data)
	path := fmt.Sprintf("/rest/v1/%s?id=eq.%s", table, id)
	body, status, err := r.doRequest(context.Background(), "PATCH", path, string(jsonData), true)
	if err != nil {
		return nil, err
	}
	if status != 200 && status != 204 {
		return nil, fmt.Errorf("update %s failed: status %d, body: %s", table, status, string(body))
	}

	var result []map[string]any
	if len(body) > 0 && body[0] == '[' {
		json.Unmarshal(body, &result)
	}
	if len(result) > 0 {
		return result[0], nil
	}
	return data, nil
}

func (r *SupabaseRepository) Delete(table string, id string) error {
	path := fmt.Sprintf("/rest/v1/%s?id=eq.%s", table, id)
	_, status, err := r.doRequest(context.Background(), "DELETE", path, "", true)
	if err != nil {
		return err
	}
	if status != 204 && status != 200 {
		return fmt.Errorf("delete %s failed: status %d", table, status)
	}
	return nil
}

func (r *SupabaseRepository) RPC(funcName string, params map[string]any) ([]map[string]any, error) {
	path := fmt.Sprintf("/rest/v1/rpc/%s", funcName)
	jsonParams, _ := json.Marshal(params)
	body, status, err := r.doRequest(context.Background(), "POST", path, string(jsonParams), false)
	if err != nil {
		return nil, err
	}
	if status != 200 && status != 201 {
		return nil, fmt.Errorf("rpc %s failed: status %d, body: %s", funcName, status, string(body))
	}
	if len(body) > 0 && body[0] == '[' {
		var result []map[string]any
		if err := json.Unmarshal(body, &result); err != nil {
			return nil, err
		}
		return result, nil
	}
	// Single object
	var result []map[string]any
	if err := json.Unmarshal(body, &result); err != nil {
		return nil, err
	}
	return result, nil
}
