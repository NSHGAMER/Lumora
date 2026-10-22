import asyncio
from types import SimpleNamespace
import httpx
import pytest
from fastapi import HTTPException
from app.services.ai_provider import ChatCompletionProvider


def settings(**changes):
    return SimpleNamespace(**({'ai_base_url': 'https://provider.example/v1', 'ai_api_key': 'test-only',
        'ai_model': 'configured-model', 'ai_timeout_seconds': 2} | changes))


def test_adapter_uses_configured_endpoint_and_validates_response(monkeypatch):
    real_client = httpx.AsyncClient
    def handle(request):
        assert str(request.url) == 'https://provider.example/v1/chat/completions'
        assert request.headers['authorization'] == 'Bearer test-only'
        return httpx.Response(200, json={'choices': [{'message': {'content': '{"answer":"Grounded","source_ids":["notice:1"],"kind":"retrieved_facts"}'}}]})
    monkeypatch.setattr(httpx, 'AsyncClient', lambda **kwargs: real_client(transport=httpx.MockTransport(handle), **kwargs))
    result = asyncio.run(ChatCompletionProvider(settings()).generate([{'role':'user','content':'A test question'}]))
    assert result['source_ids'] == ['notice:1']


@pytest.mark.parametrize('response', [httpx.Response(401, text='private-provider-error'), httpx.Response(200, json={}),
    httpx.Response(200, json={'choices':[{'message':{'content':'not-json'}}]})])
def test_adapter_errors_are_sanitized(monkeypatch, response):
    real_client = httpx.AsyncClient
    monkeypatch.setattr(httpx, 'AsyncClient', lambda **kwargs: real_client(transport=httpx.MockTransport(lambda _: response), **kwargs))
    with pytest.raises(HTTPException) as error:
        asyncio.run(ChatCompletionProvider(settings()).generate([]))
    assert error.value.status_code == 503
    assert 'private-provider-error' not in error.value.detail


@pytest.mark.parametrize('config', [settings(ai_api_key=None), settings(ai_base_url='http://provider.example')])
def test_unconfigured_or_insecure_provider_is_rejected(config):
    with pytest.raises(HTTPException) as error:
        asyncio.run(ChatCompletionProvider(config).generate([]))
    assert error.value.status_code == 503
